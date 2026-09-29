import subprocess
import psutil
import time
import sys
import threading
import os

MAX_MEMORY_MB = 2000  # Kill process if it exceeds 2GB

def monitor_memory(proc, max_mb):
    try:
        p = psutil.Process(proc.pid)
        max_seen = 0
        while proc.poll() is None:
            try:
                mem_info = p.memory_info()
                mem_mb = mem_info.rss / (1024 * 1024)
                if mem_mb > max_seen:
                    max_seen = mem_mb
                if mem_mb > max_mb:
                    print(f"\n[MONITOR] !!! PROCESS EXCEEDED {max_mb} MB - KILLING IT TO SAVE WINDOWS !!!", flush=True)
                    p.kill()
                    break
            except psutil.NoSuchProcess:
                break
            time.sleep(0.5)
        print(f"\n[MONITOR] Max memory seen: {max_seen:.2f} MB", flush=True)
    except Exception as e:
        print(f"\n[MONITOR] Monitor stopped: {e}", flush=True)

if __name__ == "__main__":
    print(f"[MONITOR] Starting python retry.py --full with a {MAX_MEMORY_MB} MB memory limit...", flush=True)
    
    # Run the script and stream its output
    proc = subprocess.Popen(
        [sys.executable, "retry.py", "--full"],
        stdout=sys.stdout,
        stderr=sys.stderr,
        env=os.environ.copy()
    )
    
    # Start the monitor thread
    monitor_thread = threading.Thread(target=monitor_memory, args=(proc, MAX_MEMORY_MB))
    monitor_thread.daemon = True
    monitor_thread.start()
    
    proc.wait()
    print(f"[MONITOR] Process exited with code {proc.returncode}", flush=True)
