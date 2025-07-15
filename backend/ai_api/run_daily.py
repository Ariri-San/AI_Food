import time
import subprocess

while True:
    subprocess.run(['python', 'retrain_model.py'])
    # time.sleep(24 * 60 * 60)  # 24 ساعت
    time.sleep(60)  # 1 دقیقه