FROM jupyter/pyspark-notebook:latest

# 추가 Python 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 작업 디렉토리 설정
WORKDIR /home/jovyan/work

# Jupyter 설정
EXPOSE 8888
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--allow-root", "--NotebookApp.token=''"] 