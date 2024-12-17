// components/Assessments.tsx
"use client";

import React, { useState } from "react";

const initialAssessments = [
  {
    id: 1,
    title: "Assessment 1",
    completion: 100,
    status: "completed",
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    questions: [
      { question: "Question 1", answer: "Answer 1" },
      { question: "Question 2", answer: "Answer 2" },
      // Add more questions and answers as needed
    ],
  },
  {
    id: 2,
    title: "Assessment 2",
    completion: 75,
    status: "ongoing",
    questions: [
      { question: "Question 1", answer: "" },
      { question: "Question 2", answer: "" },
      // Add more questions as needed
    ],
  },
];

const questions = [
  "Question 1",
  "Question 2",
  "Question 3",
  "Question 4",
  "Question 5",
  "Question 6",
  "Question 7",
  "Question 8",
  "Question 9",
  "Question 10",
  "Question 11",
  "Question 12",
  "Question 13",
  "Question 14",
  "Question 15",
];

const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [currentAssessment, setCurrentAssessment] = useState(assessments[1]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Mark assessment as completed
      const updatedAssessment = {
        ...currentAssessment,
        completion: 100,
        status: "completed",
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        questions: questions.map((q, index) => ({ question: q, answer: answers[index] })),
      };
      const updatedAssessments = assessments.map((a) =>
        a.id === currentAssessment.id ? updatedAssessment : a
      );
      setAssessments(updatedAssessments);
      setCurrentAssessment(updatedAssessment);
    }
  };

  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Assessments</h1>
      <ul>
        {assessments.map((assessment) => (
          <li key={assessment.id} className="mb-4 p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{assessment.title}</h2>
            <p>Completion: {assessment.completion}%</p>
            {assessment.status === "completed" ? (
              <p>Completed on: {assessment.date}</p>
            ) : (
              <p>Status: Ongoing</p>
            )}
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div
                className={`h-4 rounded-full ${
                  assessment.status === "completed" ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${assessment.completion}%` }}
              ></div>
            </div>
            {assessment.questions && (
              <ul className="mt-4">
                {assessment.questions.map((q, index) => (
                  <li key={index}>
                    <strong>{q.question}:</strong> {q.answer}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {currentAssessment.status === "ongoing" && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Current Assessment: {currentAssessment.title}</h2>
          <p className="mb-4">{questions[currentQuestionIndex]}</p>
          <input
            type="text"
            value={answers[currentQuestionIndex]}
            onChange={handleAnswerChange}
            className="border p-2 rounded w-full mb-4"
          />
          <button
            onClick={handleNextQuestion}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition duration-300"
          >
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Assessment"}
          </button>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
            <div className="h-4 rounded-full bg-blue-500" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="mt-2">Progress: {progress}%</p>
        </div>
      )}
    </div>
  );
};

export default Assessments;