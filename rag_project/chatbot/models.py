from django.db import models
from accounts.models import CustomUser
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    sentiment_scores = models.JSONField(default=dict)
    personality_traits = models.JSONField(default=dict)
    interaction_patterns = models.JSONField(default=dict)
def __str__(self):
        return f"Profile for {self.user.username}"

class AnonymousInteraction(models.Model):
    session_id = models.CharField(max_length=100)  # To track anonymous sessions
    question = models.TextField()
    question_sentiment = models.JSONField(default=dict)
    question_emotion = models.JSONField(default=dict)
    question_categories = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

def analyze_sentiment(self, text):
        analyzer = SentimentIntensityAnalyzer()
        return analyzer.polarity_scores(text)

def save(self, *args, **kwargs):
        if self.question:
            self.question_sentiment = self.analyze_sentiment(self.question)
        super().save(*args, **kwargs)

def __str__(self):
        return f"Anonymous Interaction: {self.question[:50]}"

class Insight(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='insights', null=True, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)  # For anonymous users
    question = models.TextField()
    insight = models.CharField(max_length=200)
    categories = models.JSONField()
    question_sentiment = models.JSONField(default=dict)
    question_emotion = models.JSONField(default=dict)
    question_categories = models.JSONField(default=list)

def analyze_sentiment(self, text):
        analyzer = SentimentIntensityAnalyzer()
        return analyzer.polarity_scores(text)

def save(self, *args, **kwargs):
        if self.question:
            self.question_sentiment = self.analyze_sentiment(self.question)
        super().save(*args, **kwargs)

def __str__(self):
        return self.insight

class Message(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)  # For anonymous users
    user_message = models.CharField(max_length=200)
    chatbot_response = models.CharField(max_length=200)
    insight = models.CharField(max_length=200)

def __str__(self):
        return f"Message: {self.user_message[:50]}"
