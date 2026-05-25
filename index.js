"use strict";

const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const https = require("https");
const app = express();
app.use(express.json());

// Helper function to make API calls to the website Wger
function fetchFromWger(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "wger.de",
      path: path,
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.end();
  });
}

// Wger muscle IDs mapped to common names
const muscleIdMap = {
  biceps: 1,
  triceps: 5,
  shoulders: 13,
  chest: 4,
  back: 12,
  lats: 12,
  traps: 9,
  abs: 6,
  glutes: 8,
  quads: 10,
  hamstrings: 11,
  calves: 7,
  legs: 10,
  arms: 1,
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
  rhomboids: "back",
};

function normalizeGroup(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  return aliases[lower] || lower;
}

// static muscle group info
const muscleInfo = {
  biceps:
    "Your biceps are on the front of your upper arm and are responsible for bending your elbow and rotating your forearm. Training them builds arm strength and size.",
  triceps:
    "Your triceps make up about two thirds of your upper arm and are responsible for extending your elbow. Training them is key for overall arm size and pushing strength.",
  shoulders:
    "Your shoulders have three heads: front, side, and rear. They lift and rotate your arm. Training all three builds well-rounded upper body strength.",
  chest:
    "Your chest muscles are responsible for pushing movements and bringing your arms across your body. Training them builds upper body pressing strength.",
  back: "Your back muscles support posture, pulling movements, and spinal stability. Training them is essential for a balanced and strong physique.",
  lats: "Your lats are the large wing-shaped muscles on either side of your back. They pull your arms down and back and build the V-taper shape.",
  traps:
    "Your trapezius runs from your neck to your mid back. It supports your neck and shoulder blades and improves posture and upper back thickness.",
  rhomboids:
    "Your rhomboids sit between your shoulder blades and retract them. Training them helps prevent rounded shoulders and improves posture.",
  abs: "Your abs stabilize your spine and support almost every movement you do. Training them improves stability and reduces injury risk.",
  glutes:
    "Your glutes are the largest muscle group in your body and power hip extension. Training them improves athletic performance and lower body strength.",
  quads:
    "Your quads are the four muscles on the front of your thigh. They extend your knee and are essential for squatting and running.",
  hamstrings:
    "Your hamstrings are on the back of your thigh and bend your knee and extend your hip. Training them balances quad strength and reduces injury risk.",
  calves:
    "Your calves push your foot down and support ankle stability. Training them improves athleticism and lower leg strength.",
  legs: "Your legs include your quads, hamstrings, glutes, and calves. Training them builds overall lower body strength and athletic performance.",
  arms: "Your arms include your biceps and triceps. Training both ensures balanced arm development and strength for pushing and pulling movements.",
};

// static injury prevention tips
const injuryTips = {
  biceps:
    "Warm up with light curls first, avoid swinging the weight, and do not curl with a fully supinated grip under heavy load.",
  triceps:
    "Warm up your elbows before heavy pressing, avoid locking out aggressively, and keep your wrists neutral throughout.",
  shoulders:
    "Always warm up your rotator cuff first, avoid behind the neck movements, and do not go too heavy on lateral raises.",
  chest:
    "Warm up your shoulders first, do not flare your elbows out to 90 degrees, and control the descent on bench press.",
  back: "Keep a neutral spine, do not round your lower back, and engage your core on all pulling movements.",
  lats: "Avoid pulling behind the neck, do not use excessive momentum on pulldowns, and keep your chest up.",
  traps:
    "Do not shrug with your neck, avoid rolling the shoulders during shrugs, and keep movements controlled.",
  rhomboids:
    "Keep your chest up on rows, do not jerk the weight, and squeeze at the top of each rep.",
  abs: "Avoid pulling on your neck during crunches, do not train abs every single day, and brace your core on all lifts.",
  glutes:
    "Warm up your hips before hip thrusts and keep your knees tracking over your toes on squats and lunges.",
  quads:
    "Warm up your knees before heavy squats, do not let your knees cave inward, and control the descent.",
  hamstrings:
    "Never skip a warm up, avoid locking out your knees aggressively, and do not train hamstrings cold.",
  calves:
    "Do not bounce at the bottom of calf raises and stretch your calves after every session to prevent tightness.",
  legs: "Warm up thoroughly, keep your knees tracking over your toes, and never skip a proper warm up.",
  arms: "Warm up your elbows and shoulders, use controlled movements, and avoid going too heavy too soon.",
};

// static cool down stretches fallback, if api is unsuccessful
const coolDownStretches = {
  biceps:
    "cross body arm stretch, doorway bicep stretch, and overhead tricep stretch",
  triceps: "overhead tricep stretch, cross body stretch, and doorway stretch",
  shoulders:
    "cross body shoulder stretch, doorway chest opener, and thread the needle stretch",
  chest: "doorway chest stretch, overhead reach, and lying chest opener",
  back: "child's pose, cat cow stretch, and seated spinal twist",
  lats: "hanging lat stretch, side bend stretch, and child's pose with arm reach",
  traps:
    "neck side tilt stretch, shoulder roll, and upper trap stretch with hand assist",
  rhomboids: "cross body hug stretch, cat cow, and seated row stretch",
  abs: "cobra pose, standing backbend, and lying full body stretch",
  glutes: "figure four stretch, pigeon pose, and seated glute stretch",
  quads:
    "standing quad stretch, kneeling hip flexor stretch, and couch stretch",
  hamstrings:
    "standing forward fold, seated hamstring stretch, and lying single leg stretch",
  calves:
    "standing calf stretch against wall, downward dog, and seated toe pull",
  legs: "standing quad stretch, standing forward fold, and figure four stretch",
  arms: "cross body arm stretch, overhead tricep stretch, and doorway bicep stretch",
};

app.post("/webhook", async (request, response) => {
  const agent = new WebhookClient({ request, response });

  function welcome(agent) {
    agent.add(
      "Hey, what's up! I'm Jim. Tell me which muscle group you want to hit today and I'll set you up with some solid exercises. So, what are we working?"
    );
  }

  function fallback(agent) {
    agent.add(
      "Hmm, I didn't quite catch that. Try saying something like 'give me a chest workout' or 'tell me about my biceps'."
    );
  }

  async function getWorkout(agent) {
    const raw = agent.parameters.MuscleGroup;
    const muscleGroup = normalizeGroup(raw);

    if (!muscleGroup) {
      agent.add(
        "Hey, which muscle group are you trying to hit? You can say something like biceps, chest, quads, or back."
      );
      return;
    }

    const muscleId = muscleIdMap[muscleGroup];

    if (!muscleId) {
      agent.add(
        `Hmm, I don't have exercises for ${muscleGroup} just yet! Try asking about chest, back, arms, or legs. I got you.`
      );
      return;
    }

    try {
      const data = await fetchFromWger(
        `/api/v2/exercise/?format=json&language=2&muscles=${muscleId}&limit=5`
      );

      if (!data.results || data.results.length === 0) {
        agent.add(
          `I couldn't find exercises for ${muscleGroup} right now. Try again in a moment!`
        );
        return;
      }

      const exerciseNames = data.results
        .filter((ex) => ex.translations && ex.translations.length > 0)
        .map((ex) => {
          const englishTranslation = ex.translations.find(
            (t) => t.language === 2
          );
          return englishTranslation ? englishTranslation.name : null;
        })
        .filter((name) => name !== null)
        .slice(0, 3);

      if (exerciseNames.length === 0) {
        agent.add(
          `I found some ${muscleGroup} exercises but had trouble reading them. Try asking again!`
        );
        return;
      }

      agent.add(
        `Let's get it! For ${muscleGroup}, you're gonna want to try ${exerciseNames.join(
          ", "
        )}. Solid choices. Need any substitutions, or you wanna know how many sets to knock out?`
      );
    } catch (error) {
      console.error("Wger API error:", error);
      agent.add(
        `I had trouble pulling exercises right now. Try again in a second!`
      );
    }
  }

  async function getSetsAndReps(agent) {
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

  function getMuscleGroupInfo(agent) {
    const raw = agent.parameters.MuscleGroup;
    const muscleGroup = normalizeGroup(raw);

    if (!muscleGroup) {
      agent.add(
        "Which muscle group did you want to learn about? You can ask about biceps, chest, quads, or any other muscle group."
      );
      return;
    }

    const info = muscleInfo[muscleGroup];

    if (!info) {
      agent.add(
        `I don't have info on ${muscleGroup} just yet. Try asking about chest, back, arms, or legs.`
      );
      return;
    }

    agent.add(info);
  }

  function getInjuryPrevention(agent) {
    const raw = agent.parameters.MuscleGroup;
    const muscleGroup = normalizeGroup(raw);

    if (!muscleGroup) {
      agent.add(
        "Which muscle group are you trying to train safely? Tell me and I will give you some injury prevention tips."
      );
      return;
    }

    const tips = injuryTips[muscleGroup];

    if (!tips) {
      agent.add(
        `I don't have injury tips for ${muscleGroup} yet. Try asking about chest, shoulders, or legs.`
      );
      return;
    }

    agent.add(
      `Here are some injury prevention tips for ${muscleGroup}: ${tips} Stay safe out there!`
    );
  }

  async function getCoolDown(agent) {
    const raw = agent.parameters.MuscleGroup;
    const muscleGroup = normalizeGroup(raw);

    if (!muscleGroup) {
      agent.add(
        "What muscle group did you just train? Tell me and I will give you some cool down stretches."
      );
      return;
    }

    const muscleId = muscleIdMap[muscleGroup];

    if (!muscleId) {
      agent.add(
        `I don't have cool down stretches for ${muscleGroup} yet. Try asking about legs, chest, or back.`
      );
      return;
    }

    try {
      const data = await fetchFromWger(
        `/api/v2/exercise/?format=json&language=2&category=10&muscles=${muscleId}&limit=3`
      );

      if (!data.results || data.results.length === 0) {
        const stretches = coolDownStretches[muscleGroup];
        if (stretches) {
          agent.add(
            `Nice work! Here are some cool down stretches for ${muscleGroup}: ${stretches}. Take your time with each one and breathe through it. You crushed it today!`
          );
        } else {
          agent.add(
            `I couldn't find cool down stretches for ${muscleGroup} right now. Try again in a moment!`
          );
        }
        return;
      }

      const stretchNames = data.results
        .filter((ex) => ex.translations && ex.translations.length > 0)
        .map((ex) => {
          const englishTranslation = ex.translations.find(
            (t) => t.language === 2
          );
          return englishTranslation ? englishTranslation.name : null;
        })
        .filter((name) => name !== null)
        .slice(0, 3);

      if (stretchNames.length === 0) {
        const stretches = coolDownStretches[muscleGroup];
        agent.add(
          `Nice work! Here are some cool down stretches for ${muscleGroup}: ${stretches}. Take your time with each one and breathe through it. You crushed it today!`
        );
        return;
      }

      agent.add(
        `Nice work! Here are some cool down stretches for ${muscleGroup}: ${stretchNames.join(
          ", "
        )}. Take your time with each one and breathe through it. You crushed it today!`
      );
    } catch (error) {
      console.error("Wger API error:", error);
      const stretches = coolDownStretches[muscleGroup];
      if (stretches) {
        agent.add(
          `Nice work! Here are some cool down stretches for ${muscleGroup}: ${stretches}. Take your time with each one and breathe through it. You crushed it today!`
        );
      } else {
        agent.add(
          `I had trouble pulling stretches right now. Try again in a second!`
        );
      }
    }
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("GetWorkoutIntent", getWorkout);
  intentMap.set("GetSetsAndRepsIntent", getSetsAndReps);
  intentMap.set("GetMuscleGroupInfoIntent", getMuscleGroupInfo);
  intentMap.set("GetInjuryPreventionIntent", getInjuryPrevention);
  intentMap.set("GetCoolDownIntent", getCoolDown);
  agent.handleRequest(intentMap);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Server is listening on port " + listener.address().port);
});
