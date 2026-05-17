"use strict";

const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
app.use(express.json());

const exercises = {
  biceps: ["barbell curls", "hammer curls", "incline dumbbell curls"],
  triceps: ["skull crushers", "tricep pushdowns", "overhead tricep extensions"],
  shoulders: ["overhead press", "lateral raises", "front raises"],
  chest: ["bench press", "incline dumbbell press", "cable flyes"],
  back: ["pull-ups", "bent over rows", "single arm dumbbell rows"],
  lats: ["lat pulldowns", "straight arm pulldowns", "wide grip pull-ups"],
  traps: ["barbell shrugs", "face pulls", "upright rows"],
  rhomboids: ["seated cable rows", "face pulls", "rear delt flyes"],
  abs: ["planks", "cable crunches", "hanging leg raises"],
  glutes: ["hip thrusts", "Romanian deadlifts", "Bulgarian split squats"],
  quads: ["leg press", "leg extensions", "goblet squats"],
  hamstrings: ["leg curls", "Romanian deadlifts", "Nordic curls"],
  calves: [
    "standing calf raises",
    "seated calf raises",
    "calf press on the leg press",
  ],
  legs: ["leg press", "Romanian deadlifts", "walking lunges"],
  arms: ["barbell curls", "skull crushers", "hammer curls"],
};

const aliases = {
  hammies: "hamstrings",
  hammy: "hamstrings",
  delts: "shoulders",
  deltoids: "shoulders",
  pecs: "chest",
  core: "abs",
  booty: "glutes",
  butt: "glutes",
  calf: "calves",
};

function normalizeGroup(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  return aliases[lower] || lower;
}

app.post("/webhook", (request, response) => {
  const agent = new WebhookClient({ request, response });

  function welcome(agent) {
    agent.add(
      "Hey, what's up! I'm Jim. Tell me which muscle group you want to hit today and I'll set you up with some solid exercises. So, what are we working?"
    );
  }

  function fallback(agent) {
    agent.add(
      "Hmm, I didn't quite catch that. Try saying something like 'give me a chest workout' or 'how many sets for biceps to build muscle'."
    );
  }

  function getWorkout(agent) {
    const raw = agent.parameters.MuscleGroup;
    const muscleGroup = normalizeGroup(raw);

    if (!muscleGroup) {
      agent.add(
        "Hey, which muscle group are you trying to hit? You can say something like biceps, chest, quads, or back."
      );
      return;
    }

    const list = exercises[muscleGroup];

    if (!list) {
      agent.add(
        `Hmm, I don't have exercises for ${muscleGroup} just yet! Try asking about chest, back, arms, or legs. I got you.`
      );
      return;
    }

    agent.add(
      `Let's get it! For ${muscleGroup}, you're gonna want to do ${list[0]}, ${list[1]}, and ${list[2]}. Solid choices. Need any substitutions, or you wanna know how many sets to knock out?`
    );
  }

  function getSetsAndReps(agent) {
    const raw = agent.parameters.MuscleGroup;
    const muscleGroup = normalizeGroup(raw);
    const fitnessGoal = (agent.parameters.FitnessGoal || "build muscle")
      .toLowerCase()
      .trim();

    if (!muscleGroup) {
      agent.add(
        "Which muscle group are you training? Say something like biceps, chest, or legs."
      );
      return;
    }

    let sets, reps;

    if (
      fitnessGoal.includes("strength") ||
      fitnessGoal.includes("strong") ||
      fitnessGoal.includes("stronger")
    ) {
      sets = "4 to 5";
      reps = "3 to 5";
    } else if (
      fitnessGoal.includes("tone") ||
      fitnessGoal.includes("lose weight") ||
      fitnessGoal.includes("endurance")
    ) {
      sets = "3";
      reps = "12 to 15";
    } else {
      sets = "3 to 4";
      reps = "8 to 12";
    }

    agent.add(
      `For ${muscleGroup} and your goal to ${fitnessGoal}, I would recommend ${sets} sets of ${reps} reps. Make sure you are resting 60 to 90 seconds between sets. You got this!`
    );
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("GetWorkoutIntent", getWorkout);
  intentMap.set("GetSetsAndRepsIntent", getSetsAndReps);
  agent.handleRequest(intentMap);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Server is listening on port " + listener.address().port);
});
