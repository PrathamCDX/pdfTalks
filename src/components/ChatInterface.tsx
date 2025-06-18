import React, { useEffect, useState } from "react";
import { Send, MessageCircle, Bot, User } from "lucide-react";
import { PDFProject } from "@/pages/Index";
import axios from "axios";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp?: Date;
}

interface ChatInterfaceProps {
  project: PDFProject;
}

// Demo Q&A data
// const demoQuestionsAndAnswers = [
//   {
//     question: "What is the main topic of this document?",
//     answer:
//       "Based on the PDF content, this document appears to discuss key concepts and methodologies. The main focus seems to be on providing comprehensive information about the subject matter presented in the uploaded file.",
//   },
//   {
//     question: "Can you summarize the key points?",
//     answer:
//       "Here are the key points from the document:\n\n1. Primary concepts and definitions\n2. Methodology and approach\n3. Key findings and insights\n4. Conclusions and recommendations\n\nThe document provides a structured overview of the topic with detailed explanations and supporting evidence.",
//   },
//   {
//     question: "What are the conclusions?",
//     answer:
//       "The document concludes with several important insights:\n\n• The methodology presented shows promising results\n• Further research is recommended in specific areas\n• The findings support the initial hypothesis\n• Practical applications are discussed for real-world implementation",
//   },
// ];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ project }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useVisitorData();

  useEffect(() => {
    console.log(" chat interface fingerprint :  ", data);
  }, [data]);

  const getResponse = async (
    question: string,
    collection_name?: string,
    limit?: number
  ) => {
    const response = await axios.post("/getanswer", {
      question,
      collection_name,
      limit,
    });

    console.log("get answer response  : ", response.data);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    getResponse(inputValue);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Get Ai response
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="h-[100vh] border border-gray-200 dark:border-gray-700 border-t-0 flex flex-col bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 transition-colors">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 pt-1">
              Ask Questions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chat with your PDF: {project.title}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900 transition-colors">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Start asking questions!
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              I'll help you understand your PDF content
            </p>

            {/* Quick Questions */}
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Try these questions:
              </p>
              {/* {demoQuestionsAndAnswers.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(demo.question)}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-gray-900 dark:text-gray-100">
                    {demo.question}
                  </span>
                </button>
              ))} */}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] ${
                    message.type === "user" ? "order-first" : ""
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 transition-colors">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) =>
              setInputValue(() => {
                return e.target.value;
              })
            }
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your PDF..."
            className="flex-1 resize-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
