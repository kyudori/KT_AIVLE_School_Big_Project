# Generated by Django 5.0.6 on 2024-07-09 07:08

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("myapp", "0014_remove_payment_next_redirect_app_url_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="audiofile",
            name="file_extension",
            field=models.CharField(default="wav", max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="audiofile",
            name="file_size",
            field=models.PositiveIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="payment",
            name="approved",
            field=models.BooleanField(default=False),
        ),
    ]
