// components/Assessments.tsx
"use client";

import React, { useState } from "react";

// 1. Define the Question and Assessment interfaces for clarity
interface Question {
  question: string;
  answer: string;
}

interface Assessment {
  id: number;
  title: string;
  completion: number;
  status: "completed" | "ongoing";
  date?: string; // optional if not yet completed
  questions: Question[];
}

// 2. Initial assessments: each with its own questions array
const initialAssessments: Assessment[] = [
  {
    id: 1,
    title: "Assessment 1",
    completion: 100,
    status: "completed",
    date: new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }),
    questions: [
      { question: "Question 1", answer: "Answer 1" },
      { question: "Question 2", answer: "Answer 2" },
      // You can add more questions as needed
    ],
  },
  {
    id: 2,
    title: "Assessment 2",
    completion: 75,
    status: "ongoing",
    // No 'date' since it's ongoing; it will get one once completed
    questions: [
      { question: "Question 1", answer: "" },
      { question: "Question 2", answer: "" },
      // Add more questions as needed
    ],
  },
];

const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // We'll store answers for whichever assessment is currently selected
  const [answers, setAnswers] = useState<string[]>([]);

  // Clicking on an assessment in the list loads it into state
  const handleAssessmentClick = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setCurrentQuestionIndex(0);
    // Initialize the 'answers' state with existing answers from this assessment
    setAnswers(assessment.questions.map((q) => q.answer));
  };

  // Handle typing in the answer input
  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentAssessment) return; // guard clause

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  // Progress to the next question, or complete the assessment if it’s the last question
  const handleNextQuestion = () => {
    if (!currentAssessment) return; // guard clause

    // If we still have more questions to go:
    if (currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Mark the assessment as completed
      const updatedAssessment: Assessment = {
        ...currentAssessment,
        completion: 100,
        status: "completed",
        date: new Date().toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        }),
        // Merge the updated answers back into the questions array
        questions: currentAssessment.questions.map((q, index) => ({
          question: q.question,
          answer: answers[index],
        })),
      };

      // Update the global assessments array
      const updatedAssessments = assessments.map((a) =>
        a.id === currentAssessment.id ? updatedAssessment : a
      );
      setAssessments(updatedAssessments);

      // Update local state
      setCurrentAssessment(updatedAssessment);
    }
  };

  // Calculate progress for the current assessment
  const progress = currentAssessment
    ? Math.round(((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100)
    : 0;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Assessments</h1>
      
      {/* List of all assessments */}
      <ul>
        {assessments.map((assessment) => (
          <li
            key={assessment.id}
            className="mb-4 p-4 border rounded shadow cursor-pointer"
            onClick={() => handleAssessmentClick(assessment)}
          >
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
          </li>
        ))}
      </ul>
      
      {/* Details for the current assessment, if one is selected */}
      {currentAssessment && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Current Assessment: {currentAssessment.title}</h2>
          
          {/* Display the Q/A pairs for reference */}
          <ul className="mb-4">
            {currentAssessment.questions.map((q, index) => (
              <li key={index} className="mb-2">
                <strong>{q.question}:</strong>{" "}
                {q.answer || <span className="text-red-500">Missing</span>}
              </li>
            ))}
          </ul>

          {/* If it's ongoing, show the interactive area */}
          {currentAssessment.status === "ongoing" && (
            <>
              <p className="mb-4">{currentAssessment.questions[currentQuestionIndex].question}</p>
              <input
                type="text"
                value={answers[currentQuestionIndex] || ""}
                onChange={handleAnswerChange}
                className="border p-2 rounded w-full mb-4"
              />
              <button
                onClick={handleNextQuestion}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition duration-300"
              >
                {currentQuestionIndex < currentAssessment.questions.length - 1
                  ? "Next Question"
                  : "Finish Assessment"}
              </button>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className="h-4 rounded-full bg-blue-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-2">Progress: {progress}%</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Assessments;
