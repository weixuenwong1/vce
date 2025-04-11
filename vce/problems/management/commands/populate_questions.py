from django.core.management.base import BaseCommand
from sympy import symbols, Eq, Mul, sin
from sympy.printing.latex import latex
from problems.models import Solution

class Command(BaseCommand):
    help = "Populate database"
    def handle(self, *args, **kwargs):
        F_net = symbols('F_{net}')
        m = symbols('m', commutative=False)
        a = symbols('a', commutative=False)
        F_r = symbols('F_{r}')
        F_down = symbols('F_{down}')
        g = symbols('g', commutative=False)
        theta = symbols(r'\theta')
        sin_theta = sin(theta)
        T = symbols('Thrust')

        equation3 = Eq(Mul(m,a), T - Mul(m,g,sin_theta) - F_r)
        equation4 = Eq(1500*1, 10000 - 1500*9.8*sin(30) - F_r) 
        latex_equation = latex(equation1)

        question = Solution.objects.create(
            question_id_id = 3,
            order_id_id = 97,
            solution_text = f"Test: {latex_equation}",
            solution_image = None
        )

        self.stdout.write(self.style.SUCCESS(f"Success:{question.solution_text}"))