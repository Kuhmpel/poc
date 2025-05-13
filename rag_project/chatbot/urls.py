from django.urls import path
from .views import ChatbotView, MessagesView, AnonymousMessagesView


urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot'),
    path('messages/', MessagesView.as_view(), name='messages'),
    path('messages/anonymous/', AnonymousMessagesView.as_view(), name='anonymous-messages'),
]
