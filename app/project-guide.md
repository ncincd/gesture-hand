# 🎹 IoT Air Piano – Gesture-Controlled Music Project

This project allows users to **play an invisible piano in the air using body or hand gestures**, powered by **computer vision and IoT**. Instead of pressing real keys, musical notes are triggered when specific **hand positions or movements** are detected via the camera. Ideal for teaching Grade 12 students a mix of **AI, gesture detection, sound synthesis, and cloud logging**.

---

## 🎯 Objectives

- Detect body or hand gestures using the webcam
- Map gestures to specific musical notes (C, D, E, F, G, A, B)
- Play notes in real-time using browser-based sound engines
- Optionally send gesture/note data to the cloud (Firebase) as an IoT event

---

## 🧰 Tools & Requirements

| Tool           | Purpose                                     |
|----------------|---------------------------------------------|
| MediaPipe Hands or Pose | For gesture and position detection        |
| Next.js        | Web app framework                           |
| Tone.js        | To play musical notes in the browser        |
| Firebase (optional) | For logging played notes to the cloud     |
| Webcam         | Required for gesture input                  |

---

## 📁 Project Structure

