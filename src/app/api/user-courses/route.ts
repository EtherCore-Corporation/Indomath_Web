import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-service';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Obtener cursos a los que tiene acceso el usuario
    const { data: contentAccess, error: accessError } = await supabaseService
      .from('content_access')
      .select(`
        *,
        user_purchases (
          product_name,
          product_type,
          course_type
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    if (accessError) {
      console.error('Error fetching content access:', accessError);
      return NextResponse.json(
        { error: 'Error al obtener acceso a cursos' },
        { status: 500 }
      );
    }

    // Obtener progreso del usuario
    const { data: progress, error: progressError } = await supabaseService
      .from('progress')
      .select(`
        *,
        lessons (
          id,
          title,
          module_id
        )
      `)
      .eq('user_id', user.id);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return NextResponse.json(
        { error: 'Error al obtener progreso' },
        { status: 500 }
      );
    }

    // Obtener información de cursos
    const courseSlugs = contentAccess
      ?.filter(access => access.content_type === 'course')
      .map(access => access.content_id) || [];

    let courses = [];
    if (courseSlugs.length > 0) {
      const { data: coursesData, error: coursesError } = await supabaseService
        .from('courses')
        .select(`
          *,
          modules (
            id,
            title,
            lessons (
              id,
              title
            )
          )
        `)
        .in('slug', courseSlugs);

      if (!coursesError && coursesData) {
        courses = coursesData.map(course => {
          const totalLessons = course.modules?.reduce((acc: number, module: Record<string, unknown>) => 
            acc + ((module.lessons as unknown[])?.length || 0), 0) || 0;
          
          const completedLessons = progress?.filter(p => 
            course.modules?.some((module: Record<string, unknown>) => 
              (module.lessons as unknown[])?.some((lesson: unknown) => (lesson as Record<string, unknown>).id === p.lesson_id)
            )
          ).filter(p => p.completed).length || 0;

          return {
            ...course,
            totalLessons,
            completedLessons,
            progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
          };
        });
      }
    }

    // Calcular estadísticas generales
    const totalCourses = courses.length;
    const completedCourses = courses.filter(course => course.progressPercentage === 100).length;
    const inProgressCourses = courses.filter(course => 
      course.progressPercentage > 0 && course.progressPercentage < 100
    ).length;
    const totalLessons = courses.reduce((acc, course) => acc + course.totalLessons, 0);
    const completedLessons = courses.reduce((acc, course) => acc + course.completedLessons, 0);

    return NextResponse.json({
      courses,
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalLessons,
        completedLessons,
        overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      },
      contentAccess,
      progress
    });

  } catch (error) {
    console.error('Error in user courses API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 