import { supabase } from './supabase.js'

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export async function getStudents() {
  const { data, error } = await supabase.from('students').select('*').order('name')
  if (error) throw error
  return data
}

export async function getStudentByPin(pin) {
  const { data, error } = await supabase
    .from('students').select('*').eq('pin', pin).single()
  if (error) return null
  return data
}

export async function upsertStudent(student) {
  const row = {
    id:            student.id,
    name:          student.name,
    tariff:        student.tariff || null,
    lessons:       student.lessons ?? 0,
    total_lessons: student.totalLessons ?? 0,
    expiry:        student.expiry || null,
    pin:           student.pin,
    lesson_price:  student.lessonPrice ? Number(student.lessonPrice) : null,
    songs:         student.songs || [],
  }
  const { error } = await supabase.from('students').upsert(row)
  if (error) throw error
}

export async function deleteStudent(id) {
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}

export async function updateStudentSongs(studentId, songs) {
  const { error } = await supabase
    .from('students').update({ songs }).eq('id', studentId)
  if (error) throw error
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export async function getPayments() {
  const { data, error } = await supabase
    .from('payments').select('*').order('date', { ascending: false })
  if (error) throw error
  return data.map(p => ({
    id:           p.id,
    studentId:    p.student_id,
    date:         p.date,
    amount:       p.amount,
    lessonsAdded: p.lessons_added,
    expiry:       p.expiry,
    note:         p.note,
  }))
}

export async function insertPayment(payment) {
  const { error } = await supabase.from('payments').insert({
    id:           payment.id,
    student_id:   payment.studentId,
    date:         payment.date,
    amount:       payment.amount,
    lessons_added:payment.lessonsAdded || null,
    expiry:       payment.expiry || null,
    note:         payment.note || null,
  })
  if (error) throw error
}

export async function deletePayment(id) {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) throw error
}

// ─── LESSONS ─────────────────────────────────────────────────────────────────
export async function getLessons() {
  const { data, error } = await supabase
    .from('lessons').select('*').order('date', { ascending: false })
  if (error) throw error
  return data.map(l => ({
    id:          l.id,
    studentId:   l.student_id,
    date:        l.date,
    type:        l.type,
    note:        l.note,
    remainAfter: l.remain_after,
  }))
}

export async function insertLesson(lesson) {
  const { error } = await supabase.from('lessons').insert({
    id:           lesson.id,
    student_id:   lesson.studentId,
    date:         lesson.date,
    type:         lesson.type,
    note:         lesson.note || null,
    remain_after: lesson.remainAfter ?? null,
  })
  if (error) throw error
}

export async function deleteLesson(id) {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}

// ─── SCHEDULE ────────────────────────────────────────────────────────────────
export async function getSchedule() {
  const { data, error } = await supabase
    .from('schedule').select('*').order('day_index').order('time')
  if (error) throw error
  return data.map(s => ({
    id:        s.id,
    studentId: s.student_id,
    dayIndex:  s.day_index,
    time:      s.time,
    label:     s.label,
    note:      s.note,
  }))
}

export async function upsertSlot(slot) {
  const { error } = await supabase.from('schedule').upsert({
    id:         slot.id,
    student_id: slot.studentId || null,
    day_index:  Number(slot.dayIndex),
    time:       slot.time,
    label:      slot.label || null,
    note:       slot.note || null,
  })
  if (error) throw error
}

export async function deleteSlot(id) {
  const { error } = await supabase.from('schedule').delete().eq('id', id)
  if (error) throw error
}

// ─── LOAD ALL ────────────────────────────────────────────────────────────────
export async function loadAll() {
  const [students, payments, lessons, schedule] = await Promise.all([
    getStudents(), getPayments(), getLessons(), getSchedule()
  ])
  // normalize students
  const normalizedStudents = students.map(s => ({
    id:           s.id,
    name:         s.name,
    tariff:       s.tariff,
    lessons:      s.lessons,
    totalLessons: s.total_lessons,
    expiry:       s.expiry,
    pin:          s.pin,
    lessonPrice:  s.lesson_price,
    songs:        s.songs || [],
  }))
  return { students: normalizedStudents, payments, lessons, schedule }
}
