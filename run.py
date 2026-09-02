"""
Slooze Food Ordering Platform - Unified Full-Stack Orchestrator
Initializes Python virtual environment, installs backend/frontend dependencies,
executes automated RBAC & Re-BAC validation tests, and launches both servers concurrently.
"""
import os
import sys
import subprocess
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("\n" + "=" * 60)
    print("      SLOOZE FOOD ORDERING SYSTEM - RUNNER & TESTER      ")
    print("=" * 60 + "\n")

    # 1. Setup Python Virtual Environment in Backend
    venv_dir = os.path.join(backend_dir, ".venv")
    if os.name == "nt":
        python_exe = os.path.join(venv_dir, "Scripts", "python.exe")
        pip_exe = os.path.join(venv_dir, "Scripts", "pip.exe")
        pytest_exe = os.path.join(venv_dir, "Scripts", "pytest.exe")
        uvicorn_exe = os.path.join(venv_dir, "Scripts", "uvicorn.exe")
    else:
        python_exe = os.path.join(venv_dir, "bin", "python")
        pip_exe = os.path.join(venv_dir, "bin", "pip")
        pytest_exe = os.path.join(venv_dir, "bin", "pytest")
        uvicorn_exe = os.path.join(venv_dir, "bin", "uvicorn")

    if not os.path.exists(venv_dir):
        print(f"[1/4] Creating Python virtual environment in {venv_dir}...")
        subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)
    else:
        print("[1/4] Python virtual environment verified.")

    # 2. Install backend dependencies
    print("[2/4] Verifying Python dependencies...")
    subprocess.run([python_exe, "-m", "pip", "install", "-r", os.path.join(backend_dir, "requirements.txt")], check=True)

    # 3. Check frontend dependencies
    print("[3/4] Checking Node.js dependencies...")
    node_modules_dir = os.path.join(frontend_dir, "node_modules")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    if not os.path.exists(node_modules_dir):
        print("-> Running npm install in frontend...")
        subprocess.run([npm_cmd, "install"], cwd=frontend_dir, check=True)
    else:
        print("-> Frontend dependencies verified.")

    # 4. Run Pytest Suite to Verify Permissions Matrix
    print("\n[4/4] Executing RBAC & Re-BAC automated security test suite...")
    test_env = os.environ.copy()
    test_env["PYTHONPATH"] = root_dir
    test_res = subprocess.run([pytest_exe, "-v"], cwd=root_dir, env=test_env)
    if test_res.returncode == 0:
        print("✅ All automated authorization and isolation tests passed successfully!\n")
    else:
        print("⚠️ Warning: Some automated tests did not pass. Proceeding with startup...\n")

    # 5. Launch Backend & Frontend Concurrently
    print("=" * 60)
    print("Launching Full-Stack Dev Services:")
    print("  -> FastAPI Backend:     http://localhost:8000/graphql (Playground)")
    print("  -> Next.js Web Client:  http://localhost:3000")
    print("=" * 60 + "\n")

    processes = []
    try:
        # Launch FastAPI backend
        backend_env = os.environ.copy()
        backend_env["PYTHONPATH"] = root_dir
        backend_proc = subprocess.Popen(
            [uvicorn_exe, "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
            cwd=root_dir,
            env=backend_env
        )
        processes.append(backend_proc)

        # Launch Next.js frontend
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=frontend_dir
        )
        processes.append(frontend_proc)

        print("Both servers are live! Press Ctrl+C to terminate both services.\n")
        while True:
            time.sleep(1)
            for p in processes:
                if p.poll() is not None:
                    raise Exception(f"Process {p.pid} terminated with code {p.returncode}")

    except KeyboardInterrupt:
        print("\nShutting down dev servers...")
    except Exception as exc:
        print(f"\nRuntime error: {exc}")
    finally:
        for p in processes:
            if p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=4)
                except subprocess.TimeoutExpired:
                    p.kill()
        print("Services cleanly stopped.")

if __name__ == "__main__":
    main()
