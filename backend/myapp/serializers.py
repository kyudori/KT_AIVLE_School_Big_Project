from rest_framework import serializers
from .models import Post, Comment

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'author_name', 'author_id', 'content', 'created_at', 'updated_at', 'post', 'is_public']
        read_only_fields = ['author', 'post']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        validated_data['post_id'] = self.context['post_id']
        return super().create(validated_data)

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'author', 'author_name', 'author_id', 'content', 'created_at', 'updated_at', 'is_notice', 'views', 'comments', 'is_public']
        read_only_fields = ['author']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)
