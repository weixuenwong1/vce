import json
from django.core.management.base import BaseCommand
from problems.models import Question, Order, Solution, Topic  # Import necessary models

class Command(BaseCommand):
    help = 'Import questions from a JSON file into the database'

    def handle(self, *args, **kwargs):
        try:
            # Load the JSON file
            with open('problems/data/questions.json', 'r', encoding='utf-8') as f:
                questions_data = json.load(f)  # This should return a list of dictionaries

            # Ensure the loaded data is a list of questions
            if isinstance(questions_data, list):
                for question_data in questions_data:
                    if isinstance(question_data, dict):
                        # Create the main Question object
                        question = Question.objects.create(
                            question_uid=question_data['question_uid'],
                            question_text=question_data['question_text'],
                            difficulty=question_data['difficulty'],
                        )

                        # Handle Many-to-Many for topics
                        if 'topic' in question_data:
                            topics = question_data['topic']
                            for topic_name in topics:
                                topic, created = Topic.objects.get_or_create(name=topic_name)
                                question.topic.add(topic)

                        # Loop through each order in the question's orders
                        for order_data in question_data['orders']:
                            if isinstance(order_data, dict):
                                # Create the Order object
                                order = Order.objects.create(
                                    question_id=question,  # Correct reference to the Question instance
                                    order_uid=order_data['order_uid'],
                                    content_type=order_data['content_type'],
                                    text_content=order_data.get('text_content', ''),
                                    image_content=order_data.get('image_content', ''),
                                    section_order=order_data['section_order'],
                                )

                                # If there is a solution, create it
                                if order_data.get('solution'):
                                    Solution.objects.create(
                                        order_id=order,
                                        solution_text=order_data['solution']['solution_text'],
                                        solution_image=order_data['solution'].get('solution_image', ''),
                                    )
            else:
                self.stdout.write(self.style.ERROR("Invalid JSON structure: Expected an array"))
                return

            self.stdout.write(self.style.SUCCESS('Questions have been successfully imported!'))

        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f"Error decoding JSON: {e}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
