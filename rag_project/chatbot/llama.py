import requests
import re

class LLaMA:
    def __init__(self):
        self.url = 'http://localhost:11434/api/chat'
        self.model = 'mistral'

    def chat(self, message, user_insights, profile_data=None):
        profile_context = ""
        if profile_data:
            dominant_emotion = max(profile_data['personality_traits'], key=profile_data['personality_traits'].get, default='neutral')
            frequent_topic = max(profile_data['interaction_patterns'], key=profile_data['interaction_patterns'].get, default='general')
            profile_context = f"The user often shows {dominant_emotion} emotions and frequently discusses {frequent_topic} topics. "

        prompt = f"{profile_context}User message: {message}"
        answer = self._get_response(prompt)

        insight_prompt = (
            f"Generate an insightful statement about the user based on the question '{message}' "
            f"and previous conversations: {', '.join(user_insights)}."
        )
        insight = self._get_response(insight_prompt)
        categories = self.categorize_insight(insight)
        return {
            'answer': answer.strip(),
            'insight': {
                'insight': insight.strip(),
                'categories': categories
            }
        }

    def _get_response(self, prompt):
        payload = {
            'model': self.model,
            'stream': False,
            'messages': [{'role': 'user', 'content': prompt}]
        }
        try:
            response = requests.post(self.url, json=payload)
            response.raise_for_status()
            data = response.json()
            if isinstance(data, dict):
                return data.get("message", {}).get("content", "")
            return "Unexpected response format."
        except requests.exceptions.RequestException as e:
            print("Request failed:", e)
            return str(e)

    def categorize_insight(self, insight):
        categories = []
        if re.search(r'\b(productivity|efficient|focus)\b', insight, re.IGNORECASE):
            categories.append('Productivity')
        if re.search(r'\b(health|wellness|fitness)\b', insight, re.IGNORECASE):
            categories.append('Health')
        if re.search(r'\b(relationship|social|communication)\b', insight, re.IGNORECASE):
            categories.append('Relationships')
        return categories