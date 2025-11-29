"use client"

import { useState } from "react"
import {
  Mic,
  MessageSquare,
  Globe,
  FileText,
  Video,
  BookOpen,
  GraduationCap,
  Briefcase,
  User,
  Award,
  FileSearch,
  ClipboardList,
  PlayCircle,
  Headphones,
  Languages,
  Users,
  Activity,
  Gamepad,
  Bookmark,
  Search,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const AITutorsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // AI Tutors data categorized by type
  const aiTutors = {
    voice: [
      {
        id: 1,
        title: "Debate AI",
        description: "Practice debating on any topic with AI opponent",
        icon: <Mic className="h-6 w-6" />,
        category: "Voice",
        color: "text-purple-600 bg-purple-100",
      },
      {
        id: 2,
        title: "Language Teacher",
        description: "Learn languages through conversational practice",
        icon: <Languages className="h-6 w-6" />,
        category: "Voice",
        color: "text-blue-600 bg-blue-100",
      },
      {
        id: 3,
        title: "Mock Interview AI",
        description: "Practice job interviews with realistic AI interviewers",
        icon: <User className="h-6 w-6" />,
        category: "Voice",
        color: "text-green-600 bg-green-100",
      },
    ],
    chat: [
      {
        id: 4,
        title: "Education Advisor",
        description: "Get personalized learning path recommendations",
        icon: <GraduationCap className="h-6 w-6" />,
        category: "Chat",
        color: "text-yellow-600 bg-yellow-100",
      },
      {
        id: 5,
        title: "Career Coach AI",
        description: "Get guidance on career development and progression",
        icon: <Briefcase className="h-6 w-6" />,
        category: "Chat",
        color: "text-red-600 bg-red-100",
      },
      {
        id: 6,
        title: "Discussion AI",
        description: "Engage in thought-provoking discussions on any topic",
        icon: <MessageSquare className="h-6 w-6" />,
        category: "Chat",
        color: "text-indigo-600 bg-indigo-100",
      },
    ],
    scraping: [
      {
        id: 7,
        title: "Web Scraping Tutor",
        description: "Learn web scraping techniques with guided tutorials",
        icon: <Globe className="h-6 w-6" />,
        category: "Scraping",
        color: "text-pink-600 bg-pink-100",
      },
      {
        id: 8,
        title: "PDF Summary",
        description: "Upload PDFs and get concise summaries with key points",
        icon: <FileText className="h-6 w-6" />,
        category: "Scraping",
        color: "text-orange-600 bg-orange-100",
      },
      {
        id: 9,
        title: "Research Assistant",
        description: "Gather and synthesize information from multiple sources",
        icon: <FileSearch className="h-6 w-6" />,
        category: "Scraping",
        color: "text-teal-600 bg-teal-100",
      },
    ],
    multimedia: [
      {
        id: 10,
        title: "Video Extractor",
        description: "Analyze and extract key information from videos",
        icon: <Video className="h-6 w-6" />,
        category: "Multimedia",
        color: "text-amber-600 bg-amber-100",
      },
      {
        id: 11,
        title: "Podcasts & Audiobooks",
        description: "Interactive learning through audio content",
        icon: <Headphones className="h-6 w-6" />,
        category: "Multimedia",
        color: "text-lime-600 bg-lime-100",
      },
      {
        id: 12,
        title: "Video Creation AI",
        description: "Create educational videos with AI assistance",
        icon: <PlayCircle className="h-6 w-6" />,
        category: "Multimedia",
        color: "text-cyan-600 bg-cyan-100",
      },
    ],
    assessment: [
      {
        id: 13,
        title: "Test Prep",
        description: "Personalized test preparation for various exams",
        icon: <ClipboardList className="h-6 w-6" />,
        category: "Assessment",
        color: "text-violet-600 bg-violet-100",
      },
      {
        id: 14,
        title: "Exam Simulator",
        description: "Practice exams with realistic conditions",
        icon: <Award className="h-6 w-6" />,
        category: "Assessment",
        color: "text-emerald-600 bg-emerald-100",
      },
      {
        id: 15,
        title: "Flashcards & Chat",
        description: "Interactive flashcards with spaced repetition",
        icon: <FileText className="h-6 w-6" />,
        category: "Assessment",
        color: "text-rose-600 bg-rose-100",
      },
    ],
    creative: [
      {
        id: 16,
        title: "AI Characters",
        description: "Interact with historical or fictional characters",
        icon: <Users className="h-6 w-6" />,
        category: "Creative",
        color: "text-sky-600 bg-sky-100",
      },
      {
        id: 17,
        title: "Gamify Activity",
        description: "Turn any learning activity into a game",
        icon: <Gamepad className="h-6 w-6" />,
        category: "Creative",
        color: "text-fuchsia-600 bg-fuchsia-100",
      },
      {
        id: 18,
        title: "Course Generator",
        description: "Create customized courses on any topic",
        icon: <BookOpen className="h-6 w-6" />,
        category: "Creative",
        color: "text-amber-600 bg-amber-100",
      },
    ],
  }

  // Combine all tutors for "All" tab
  const allTutors = Object.values(aiTutors).flat()

  const filteredTutors = {
    all: allTutors.filter(tutor =>
      tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    voice: aiTutors.voice.filter(tutor =>
      tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    chat: aiTutors.chat.filter(tutor =>
      tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    scraping: aiTutors.scraping.filter(tutor =>
      tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    multimedia: aiTutors.multimedia.filter(tutor =>
      tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    assessment: aiTutors.assessment.filter(tutor =>
      tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    creative: aiTutors.creative.filter(tutor =>
      tutor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6" />
            AI Voice Tutors
          </h1>
          <p className="text-muted-foreground">
            Interactive AI-powered tutors for all your learning needs
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search AI tutors..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="voice" className="flex gap-2">
            <Mic className="h-4 w-4" /> Voice
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex gap-2">
            <MessageSquare className="h-4 w-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="scraping" className="flex gap-2">
            <Globe className="h-4 w-4" /> Scraping
          </TabsTrigger>
          <TabsTrigger value="multimedia" className="flex gap-2">
            <Video className="h-4 w-4" /> Multimedia
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex gap-2">
            <ClipboardList className="h-4 w-4" /> Assessment
          </TabsTrigger>
          <TabsTrigger value="creative" className="flex gap-2">
            <Gamepad className="h-4 w-4" /> Creative
          </TabsTrigger>
        </TabsList>

        {/* All Tutors */}
        <TabsContent value="all" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.all.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </TabsContent>

        {/* Voice Tutors */}
        <TabsContent value="voice" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.voice.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </TabsContent>

        {/* Chat Tutors */}
        <TabsContent value="chat" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.chat.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </TabsContent>

        {/* Scraping Tutors */}
        <TabsContent value="scraping" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.scraping.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </TabsContent>

        {/* Multimedia Tutors */}
        <TabsContent value="multimedia" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.multimedia.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </TabsContent>

        {/* Assessment Tutors */}
        <TabsContent value="assessment" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.assessment.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </TabsContent>

        {/* Creative Tutors */}
        <TabsContent value="creative" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.creative.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

const TutorCard = ({ tutor }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${tutor.color}`}>
            {tutor.icon}
          </div>
          <div>
            <CardTitle>{tutor.title}</CardTitle>
            <Badge variant="outline" className="mt-1">
              {tutor.category}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Bookmark className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{tutor.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Learn More
        </Button>
        <Button size="sm">
          <PlayCircle className="h-4 w-4 mr-2" />
          Start
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AITutorsPage