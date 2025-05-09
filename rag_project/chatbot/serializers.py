from rest_framework import serializers
from .models import Message, Insight, AnonymousInteraction

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('user_message', 'chatbot_response', 'insight')
class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = ('question', 'insight', 'categories', 'question_sentiment', 'question_emotion', 'question_categories')
class AnonymousInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnonymousInteraction
        fields = ('question', 'question_sentiment', 'question_emotion', 'question_categories')

