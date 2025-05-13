from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from accounts.models import CustomUser
from .models import Message, Insight, UserProfile, AnonymousInteraction
from .serializers import MessageSerializer, InsightSerializer, AnonymousInteractionSerializer
from .llama import LLaMA
from transformers import pipeline
import re
import uuid

class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.sentiment_analyzer = pipeline('sentiment-analysis')
        self.emotion_analyzer = pipeline('text-classification', model='bhadresh-savani/distilbert-base-uncased-emotion')

    def analyze_question(self, question):
        sentiment = self.sentiment_analyzer(question)[0]
        emotion = self.emotion_analyzer(question)[0]
        categories = self.categorize_insight(question)
        return sentiment, emotion, categories

    def categorize_insight(self, text):
        categories = []
        if re.search(r'\b(productivity|efficient|focus)\b', text, re.IGNORECASE):
            categories.append('Productivity')
        if re.search(r'\b(health|wellness|fitness)\b', text, re.IGNORECASE):
            categories.append('Health')
        if re.search(r'\b(relationship|social|communication)\b', text, re.IGNORECASE):
            categories.append('Relationships')
        return categories

    def update_user_profile(self, user, sentiment, emotion, categories):
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.sentiment_scores.update({str(len(profile.sentiment_scores)): sentiment})
        profile.personality_traits.update({
            emotion['label']: profile.personality_traits.get(emotion['label'], 0) + emotion['score']
        })
        for category in categories:
            profile.interaction_patterns[category] = profile.interaction_patterns.get(category, 0) + 1
        profile.save()

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        message = request.data.get('message')
        session_id = request.data.get('session_id', str(uuid.uuid4()))  # Generate or use provided session ID

        if not message or not isinstance(message, str):
            return Response({'error': 'Message is required and must be a string'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch previous insights
        if user:
            previous_insights = [i.insight for i in user.insights.all()]
        else:
            previous_insights = [i.insight for i in Insight.objects.filter(session_id=session_id)]

        # Perform NLP analysis
        question_sentiment, question_emotion, question_categories = self.analyze_question(message)

        # Update user profile or save anonymous interaction
        if user:
            self.update_user_profile(user, question_sentiment, question_emotion, question_categories)
        else:
            AnonymousInteraction.objects.create(
                session_id=session_id,
                question=message,
                question_sentiment=question_sentiment,
                question_emotion=question_emotion,
                question_categories=question_categories
            )

        # Generate response from LLaMA
        profile_data = None
        if user:
            user_profile = getattr(user, 'profile', None)
            profile_data = {
                'sentiment_scores': user_profile.sentiment_scores if user_profile else {},
                'personality_traits': user_profile.personality_traits if user_profile else {},
                'interaction_patterns': user_profile.interaction_patterns if user_profile else {}
            }

        llama = LLaMA()
        try:
            result = llama.chat(message, previous_insights, profile_data=profile_data)
            chatbot_response = result['answer']
            insight_text = result['insight']['insight']
            categories = result['insight']['categories']

            # Save message and insight
            Message.objects.create(
                user=user,
                session_id=session_id if not user else None,
                user_message=message,
                chatbot_response=chatbot_response,
                insight=insight_text
            )
            Insight.objects.create(
                user=user,
                session_id=session_id if not user else None,
                question=message,
                insight=insight_text,
                categories=categories,
                question_sentiment=question_sentiment,
                question_emotion=question_emotion,
                question_categories=question_categories
            )

            response_data = {
                'session_id': session_id if not user else None,
                'chatbotResponse': chatbot_response,
                'insight': insight_text,
                'categories': categories,
                'anonymous': user is None,
                'question_sentiment': question_sentiment,
                'question_emotion': question_emotion,
                'question_categories': question_categories
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to process response: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = Message.objects.filter(user=request.user)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AnonymousMessagesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        messages = Message.objects.filter(session_id=session_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)