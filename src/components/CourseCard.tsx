"use client";
import React from 'react';
import Link from 'next/link';
import { AcademicCapIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ProgressCircle from './ProgressCircle';

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    image_url?: string;
    progressPercentage: number;
    totalLessons: number;
    completedLessons: number;
    level?: string;
    duration?: string;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 50) return '#F59E0B'; // Yellow
    return '#3B82F6'; // Blue
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage === 100) return 'Completado';
    if (percentage >= 80) return 'Casi terminado';
    if (percentage >= 50) return 'En progreso';
    if (percentage > 0) return 'Comenzado';
    return 'No iniciado';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Course Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {course.description}
            </p>
          </div>
          <div className="ml-4">
            <ProgressCircle
              percentage={course.progressPercentage}
              size={60}
              strokeWidth={4}
              color={getProgressColor(course.progressPercentage)}
              showPercentage={false}
            />
          </div>
        </div>

        {/* Course Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <AcademicCapIcon className="w-4 h-4" />
            <span>{course.completedLessons}/{course.totalLessons} lecciones</span>
          </div>
          {course.level && (
            <div className="flex items-center space-x-1">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {course.level}
              </span>
            </div>
          )}
          {course.duration && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso
            </span>
            <span className="text-sm text-gray-600">
              {course.progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${course.progressPercentage}%`,
                backgroundColor: getProgressColor(course.progressPercentage)
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {getProgressStatus(course.progressPercentage)}
            </span>
            {course.progressPercentage === 100 && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircleIcon className="w-4 h-4" />
                <span className="text-xs font-medium">¡Completado!</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/cursos/${course.slug}`}
          className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
        >
          {course.progressPercentage === 100 ? 'Repasar curso' : 'Continuar curso'}
        </Link>
      </div>
    </div>
  );
} 