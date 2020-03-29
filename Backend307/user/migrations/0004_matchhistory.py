# Generated by Django 3.0.4 on 2020-03-28 21:52

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('user', '0003_delete_matchhistory'),
    ]

    operations = [
        migrations.CreateModel(
            name='MatchHistory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('match_time', models.DateTimeField(auto_now_add=True)),
                ('username_1', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='user1', to=settings.AUTH_USER_MODEL)),
                ('username_2', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='user2', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='winner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]