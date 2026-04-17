from django.core.management.base import BaseCommand
from django.urls import get_resolver

class Command(BaseCommand):
    help = "Print URL names available for reversing (quick debug)."

    def handle(self, *args, **options):
        resolver = get_resolver()
        names = sorted({k for k in resolver.reverse_dict.keys() if isinstance(k, str)})
        for n in names:
            self.stdout.write(n)
