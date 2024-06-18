import os
import django
import MySQLdb
from django.conf import settings

# Django 설정 모듈을 지정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bigproject.settings')
django.setup()

def create_database():
    db_settings = settings.DATABASES['default']
    db_name = db_settings['NAME']
    db_user = db_settings['USER']
    db_password = db_settings['PASSWORD']
    db_host = db_settings['HOST']
    db_port = db_settings['PORT']

    # MySQL에 접속
    db = MySQLdb.connect(
        host=db_host,
        user=db_user,
        passwd=db_password,
        port=int(db_port)
    )
    cursor = db.cursor()

    # 데이터베이스가 존재하는지 확인하고, 없으면 생성
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET UTF8;")
    cursor.execute(f"USE {db_name};")
    
    # 테이블 생성
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(256) NOT NULL,
        role VARCHAR(20) NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS files (
        file_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        file_path VARCHAR(256) NOT NULL,
        upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS results (
        result_id INT AUTO_INCREMENT PRIMARY KEY,
        file_id INT,
        is_deepfake BOOLEAN NOT NULL,
        confidence FLOAT NOT NULL,
        detection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (file_id) REFERENCES files(file_id)
    );
    """)
    db.commit()

    cursor.close()
    db.close()

if __name__ == '__main__':
    create_database()
