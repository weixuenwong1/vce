from django.shortcuts import render, get_object_or_404
from .models import Question

# Create your views here.
def index(request, question_id): 
    question = get_object_or_404(Question, pk = question_id)
    orders = question.order.all().order_by('section_order')

    context = {
        'question':question,
        'orders': orders,
    }
    return render(request, 'problems/question_detail.html', context)