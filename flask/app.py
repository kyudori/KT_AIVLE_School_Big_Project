from flask import Flask, request, jsonify
import os
import requests

app = Flask(__name__)

DJANGO_URL = os.getenv('DJANGO_URL')


# 웹에서 체험용 요청을 처리하는 엔드포인트
@app.route('/web-analyze', methods=['POST'])
def web_analyze():
    data = request.json
    file_path = data.get('file_path')
    if not file_path or not os.path.exists(file_path):
        return jsonify({'result': 0}), 400

    # AI 모델 실행
    if file_path.endswith(('.wav', '.mp3', '.ogg', '.flac')):
        result = 1
    else:
        result = 0

    return jsonify({'result': result})

# 외부 API 요청을 처리하는 엔드포인트
@app.route('/api-analyze', methods=['POST'])
def api_analyze():
    api_key = request.headers.get('Authorization')
    if not api_key:
        return jsonify({'error': 'Missing API key'}), 401

    api_key = api_key.replace('Bearer ', '')
    response = requests.post(f'{DJANGO_URL}/api/validate-key/', headers={'Authorization': f'Bearer {api_key}'})
    
    if response.status_code != 200:
        return jsonify({'error': 'Invalid API key or insufficient credits'}), 401

    data = request.json
    file_path = data.get('file_path')
    if not file_path or not os.path.exists(file_path):
        return jsonify({'result': 0}), 400

    # AI 모델 실행 (예시)
    if file_path.endswith(('.wav', '.mp3', '.ogg', '.flac')):
        result = 1
    else:
        result = 0

    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)
