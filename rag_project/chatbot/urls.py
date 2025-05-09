from django.urls import path
from .views import ChatbotView, MessagesView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot'),
    path('messages/', MessagesView.as_view(), name='messages'),
]