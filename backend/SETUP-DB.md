# How to create the neurotrade database and run the backend

Do these **two things once** so the app can run.

---

## Step 1: Create the database (choose one way)

### Option A – Run the script (easiest)

1. Open **File Explorer** and go to the backend folder:
   ```
   C:\Users\LENOVO\.gemini\antigravity\scratch\neurotrade\backend
   ```
2. Find the file **`create-database.ps1`**.
3. **Right‑click** it → **Run with PowerShell**.
4. If a window says “cannot be loaded because running scripts is disabled”:
   - Open **PowerShell** (Start menu → type **PowerShell** → open it).
   - Run this once (you may need to type `Y` and press Enter):
     ```powershell
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```
   - Then go back to step 2 and **Run with PowerShell** again.
5. When it finishes, you should see: **Database 'neurotrade' created successfully.**

If you see “database already exists”, that’s fine — go to Step 2.

---

### Option B – Use pgAdmin (if you have it)

1. Open **pgAdmin** (from Start menu or desktop).
2. In the left panel, click your **PostgreSQL** server (e.g. “PostgreSQL 17”).
3. When it asks for a password, type: **postgres** (and save if you want).
4. **Right‑click** on **Databases** → **Create** → **Database**.
5. In **Database** name, type: **neurotrade**.
6. Click **Save**.
7. You should see **neurotrade** under Databases. Done.

---

## Step 2: Start the backend

1. Open **PowerShell** or **Command Prompt**.
2. Go to the backend folder:
   ```powershell
   cd C:\Users\LENOVO\.gemini\antigravity\scratch\neurotrade\backend
   ```
3. Start the app:
   ```powershell
   mvn spring-boot:run
   ```
4. Wait until you see a line like:
   ```text
   Started NeurotradeBackendApplication in X seconds
   ```
   and the app listening on port **8080**. Do not close this window.
5. In your browser, open the app (e.g. http://localhost:5173) and try **Register** again. The “Cannot reach server” message should be gone.

---

## If something goes wrong

- **“PostgreSQL not found”** when running the script  
  You may have a different PostgreSQL version. Open `create-database.ps1` in a text editor, find the line `$pgVersion = "17"` and change **17** to your version (e.g. **16** or **15**), then save and run the script again.

- **“password authentication failed”**  
  Your PostgreSQL `postgres` user might use a different password. Open `create-database.ps1`, change `$dbPassword = "postgres"` to your real password, save and run again.

- **Backend still says “database neurotrade does not exist”**  
  Make sure Step 1 really finished without errors (script said “created successfully” or you see **neurotrade** in pgAdmin). Then run Step 2 again.
