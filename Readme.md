# FixA11y

AI-powered accessibility fixing tool

🚀 Getting Started
Follow these steps to set up and run the project locally.

**Step 1: Clone the Repository**

```bash
git clone https://github.com/your-username/fixa11y.git
cd fixa11y
```

**Step 2: Setup the Backend**
In the root directory, Install the dependencies.

```bash
npm install
```

Copy the .env.example in .env.

```bash
cp .env.example .env
```

**Step 3: Setup the frontend**
Navigate to the `fontend` directory.

```bash
cd frontend
```

Install the dependencies.

```bash
npm install
```

```bash
cp .env.example .env
```

**Step 4: Run the services**
You need three separate terminals to run all services concurrently

1. Start Redis(using docker):

```bash
docker run --name my-redis -p 6379:6379 -d redis
```

2. Start Backend API Server:
   In the root directory run:

```bash
node src/app.js
```

(The Server will be running on `http://localhost:8010`)

3. Start the BullMQ Worker:
   In a separate terminal, in the root directory run:

```bash
npm start:worker
```

(This process will start listening for jobs in the Redis queue)

4. Start the Frontend Dev Server:
   In a third terminal, navigate to the frontend/ directory and run:

```bash
npm run dev
(The UI will be accessible at http://localhost:5173)
```
