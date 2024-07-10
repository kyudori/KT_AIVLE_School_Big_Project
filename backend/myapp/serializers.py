from rest_framework import serializers
from .models import Post, Comment

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'author_name', 'content', 'created_at', 'updated_at', 'post', 'is_public']

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'author', 'author_name', 'content', 'created_at', 'updated_at', 'is_notice', 'views', 'comments', 'is_public']
