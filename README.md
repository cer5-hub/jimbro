# Jim Bro 
## Voice-Powered Fitness Assistant

Jim Bro is a conversational voice assistant built with Dialogflow that acts as a 
knowledgeable and encouraging gym buddy. Tell Jim which muscle group you want to 
train and he will hook you up with exercises, sets and reps guidance, injury 
prevention tips, and cool down stretches. 

**Try it live:** [Web Demo](https://bot.dialogflow.com/a801990b-cc09-4ef2-8f25-c6487db4f82d)


## Features

| Intent | What it does |
|---|---|
| `GetWorkoutIntent` | Returns live exercise recommendations for a muscle group via the Wger API |
| `GetSetsAndRepsIntent` | Recommends sets and reps based on muscle group and fitness goal |
| `GetMuscleGroupInfoIntent` | Explains what a muscle group does and why to train it |
| `GetInjuryPreventionIntent` | Provides safety tips for training a specific muscle group |
| `GeCoolDownIntent` | Recommends cool down stretches after a workout via the Wger API |

---

---

## Tech Stack

- **Platform:** Dialogflow (Google)
- **Fulfillment:** Node.js, Express
- **API:** [Wger Workout Manager API](https://wger.de/api/v2/) — free, open source, no key required
- **Hosting:** Render
- **Version Control:** GitHub

---

---

## How to Run Locally

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/cer5-hub/jimbro.git
cd jimbro

# Install dependencies
npm install

# Start the server
node index.js
```

Server will run on `http://localhost:10000`

**Live fulfillment endpoint:** `https://jimbro-1.onrender.com/webhook`

To connect to Dialogflow, expose your local server using a tool like 
[ngrok](https://ngrok.com/) and update the webhook URL in the 
Dialogflow Fulfillment settings.

---

---

## Supported Muscle Groups

`biceps` · `triceps` · `shoulders` · `chest` · `back` · `lats` · `traps` · 
`rhomboids` · `abs` · `glutes` · `quads` · `hamstrings` · `calves` · `legs` · `arms`

Also understands gym slang: `hammies` → hamstrings, `delts` → shoulders, 
`pecs` → chest, `core` → abs

---

## Author

**Erika Cervantes Arellano**  
Portland State University  
[LinkedIn](https://linkedin.com/in/cervantes-erika) · [GitHub](https://github.com/cer5-hub)




