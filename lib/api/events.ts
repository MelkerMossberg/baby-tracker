import { supabase } from '../supabase'
import type { Event, EventType, EventWithBaby, EventMetadata } from '../supabase'

// Import the local Event type for compatibility with existing app
import type { Event as LocalEvent, NursingSide } from '../../types/models'

/**
 * Convert Supabase event to local event format
 */
function convertToLocalEvent(supabaseEvent: Event): LocalEvent {
  const metadata = supabaseEvent.metadata as any || {}
  
  return {
    id: supabaseEvent.id,
    type: supabaseEvent.type,
    timestamp: new Date(supabaseEvent.timestamp),
    duration: supabaseEvent.duration || undefined,
    notes: supabaseEvent.notes || undefined,
    babyId: supabaseEvent.baby_id,
    // Handle nursing side
    side: metadata.nursing?.side || undefined,
    // Handle pumping fields
    pumpingSide: metadata.pumping?.side || undefined,
    milliliters: metadata.pumping?.milliliters || undefined,
  }
}

/**
 * Convert local event to Supabase format
 */
function convertFromLocalEvent(localEvent: Partial<LocalEvent>, babyId: string, createdBy: string): any {
  const metadata: EventMetadata = {}
  
  // Handle nursing metadata
  if (localEvent.type === 'nursing' && localEvent.side) {
    metadata.nursing = { side: localEvent.side }
  }
  
  // Handle pumping metadata
  if (localEvent.type === 'pumping') {
    metadata.pumping = {
      side: localEvent.pumpingSide,
      milliliters: localEvent.milliliters
    }
  }
  
  return {
    baby_id: babyId,
    created_by: createdBy,
    type: localEvent.type,
    timestamp: localEvent.timestamp?.toISOString() || new Date().toISOString(),
    duration: localEvent.duration || null,
    notes: localEvent.notes || null,
    metadata
  }
}

/**
 * Get events for a specific baby (compatible with existing app)
 */
export async function getEventsForBabyLocal(
  babyId: string,
  limit: number = 50
): Promise<LocalEvent[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('baby_id', babyId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`)
    }

    return data.map(convertToLocalEvent)
  } catch (error) {
    console.error('Error fetching events for baby:', error)
    throw error
  }
}

/**
 * Get events by type for a baby (compatible with existing app)
 */
export async function getEventsByTypeLocal(
  babyId: string,
  eventType: EventType,
  limit: number = 50
): Promise<LocalEvent[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('baby_id', babyId)
      .eq('type', eventType)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch ${eventType} events: ${error.message}`)
    }

    return data.map(convertToLocalEvent)
  } catch (error) {
    console.error(`Error fetching ${eventType} events:`, error)
    throw error
  }
}

/**
 * Create an event (compatible with existing app)
 */
export async function createEventLocal(
  babyId: string,
  eventData: Partial<LocalEvent>
): Promise<LocalEvent> {
  try {
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user) {
      throw new Error('User must be authenticated')
    }

    if (!eventData.type) {
      throw new Error('Event type is required')
    }

    const supabaseEventData = convertFromLocalEvent(eventData, babyId, user.user.id)

    const { data, error } = await supabase
      .from('events')
      .insert(supabaseEventData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`)
    }

    const localEvent = convertToLocalEvent(data)
    console.log('✅ Created event with Supabase ID:', localEvent.id, 'for original ID:', eventData.id)
    return localEvent
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

/**
 * Update an event (compatible with existing app)
 */
export async function updateEventLocal(
  eventId: string,
  updates: Partial<LocalEvent>
): Promise<LocalEvent> {
  try {
    // First get the existing event to maintain baby_id and created_by
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch existing event: ${fetchError.message}`)
    }

    const supabaseUpdates = convertFromLocalEvent(updates, existingEvent.baby_id, existingEvent.created_by)
    
    // Remove fields that shouldn't be updated
    delete supabaseUpdates.baby_id
    delete supabaseUpdates.created_by

    const { data, error } = await supabase
      .from('events')
      .update(supabaseUpdates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`)
    }

    return convertToLocalEvent(data)
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

/**
 * Delete an event (compatible with existing app)
 */
export async function deleteEventLocal(eventId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}

/**
 * Get events for a baby with optional event type filtering (enhanced version)
 * Returns all events for the baby, scoped to current user's access only
 * 
 * @param babyId - The baby's ID (required)
 * @param eventType - Optional event type filter ('nursing', 'sleep', 'diaper', 'pumping', 'bottle', 'solids')
 * @returns Promise<LocalEvent[]> - Array of events in local format, ordered by timestamp (newest first)
 * @throws Error if baby ID is missing, user lacks access, or invalid event type provided
 * 
 * @example
 * ```typescript
 * // Get all events for a baby
 * const allEvents = await getEventsForBaby('baby-123')
 * 
 * // Get only nursing events
 * const nursingEvents = await getEventsForBaby('baby-123', 'nursing')
 * 
 * // Handle errors
 * try {
 *   const events = await getEventsForBaby('baby-123', 'sleep')
 * } catch (error) {
 *   console.error('Failed to fetch events:', error.message)
 * }
 * ```
 */
export async function getEventsForBaby(
  babyId: string, 
  eventType?: EventType
): Promise<LocalEvent[]> {
  try {
    // Validate inputs
    if (!babyId) {
      throw new Error('Baby ID is required')
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('User must be authenticated')
    }

    // Use RPC function to get events (bypasses RLS issues)
    let data: any[]
    let error: any
    
    if (eventType) {
      // Validate event type
      const validEventTypes: EventType[] = ['nursing', 'sleep', 'diaper', 'pumping', 'bottle', 'solids']
      if (!validEventTypes.includes(eventType)) {
        throw new Error(`Invalid event type: ${eventType}. Must be one of: ${validEventTypes.join(', ')}`)
      }
      
      // Use event type specific RPC function
      const result = await supabase.rpc('get_baby_events_by_type', {
        p_user_id: user.id,
        p_baby_id: babyId,
        p_event_type: eventType
      })
      data = result.data
      error = result.error
    } else {
      // Get all events for baby
      const result = await supabase.rpc('get_baby_events', {
        p_user_id: user.id,
        p_baby_id: babyId
      })
      data = result.data
      error = result.error
    }

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`)
    }

    if (!data) {
      return []
    }

    // Convert RPC results to events format and then to local format
    const events = data.map(row => ({
      id: row.event_id,
      baby_id: row.baby_id,
      created_by: row.created_by,
      type: row.event_type,
      timestamp: row.event_timestamp,
      duration: row.duration,
      notes: row.notes,
      metadata: row.metadata
    }))
    
    return events.map(convertToLocalEvent)

  } catch (error) {
    console.error('Error fetching events for baby:', error)
    
    // Re-throw with more context if it's our custom error
    if (error instanceof Error) {
      throw error
    }
    
    // Handle unexpected errors
    throw new Error(`Unexpected error while fetching events: ${String(error)}`)
  }
}

/**
 * Get today's events for a baby with optional event type filtering
 * Returns events from today (00:00 to 23:59), scoped to current user's access only
 * 
 * @param babyId - The baby's ID (required)
 * @param eventType - Optional event type filter
 * @returns Promise<LocalEvent[]> - Array of today's events in local format
 * @throws Error if baby ID is missing or user lacks access
 * 
 * @example
 * ```typescript
 * // Get all events from today
 * const todaysEvents = await getTodaysEventsForBaby('baby-123')
 * 
 * // Get only today's nursing events
 * const todaysNursing = await getTodaysEventsForBaby('baby-123', 'nursing')
 * ```
 */
export async function getTodaysEventsForBaby(
  babyId: string,
  eventType?: EventType
): Promise<LocalEvent[]> {
  try {
    // Validate inputs
    if (!babyId) {
      throw new Error('Baby ID is required')
    }

    // Get all events first using our safe RPC function
    const allEvents = await getEventsForBaby(babyId, eventType)
    
    // Filter to today's events
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return allEvents.filter(event => {
      const eventTime = new Date(event.timestamp)
      return eventTime >= today && eventTime < tomorrow
    })

  } catch (error) {
    console.error('Error fetching today\'s events for baby:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error(`Unexpected error while fetching today's events: ${String(error)}`)
  }
}

/**
 * Get events for a specific baby (original Supabase format with pagination)
 * @deprecated Use getEventsForBaby instead for better type safety and access control
 */
export async function getEventsForBabyPaginated(
  babyId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('baby_id', babyId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`)
  }

  return data
}

/**
 * Get events for a specific baby with baby info included
 */
export async function getEventsWithBaby(
  babyId: string,
  limit: number = 50
): Promise<EventWithBaby[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      baby_profiles (*)
    `)
    .eq('baby_id', babyId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch events with baby info: ${error.message}`)
  }

  return data as EventWithBaby[]
}

/**
 * Get events by type for a baby
 */
export async function getEventsByType(
  babyId: string,
  eventType: EventType,
  limit: number = 50
): Promise<Event[]> {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('User must be authenticated')
    }

    // Use RPC function to get events by type (bypasses RLS issues)
    const { data, error } = await supabase.rpc('get_baby_events_by_type', {
      p_user_id: user.id,
      p_baby_id: babyId,
      p_event_type: eventType
    })

    if (error) {
      throw new Error(`Failed to fetch ${eventType} events: ${error.message}`)
    }

    if (!data) {
      return []
    }

    // Convert RPC results to events format and apply limit
    const events = data.slice(0, limit).map(row => ({
      id: row.event_id,
      baby_id: row.baby_id,
      created_by: row.created_by,
      type: row.event_type as "nursing" | "sleep" | "diaper" | "pumping" | "bottle" | "solids",
      timestamp: row.event_timestamp,
      duration: row.duration,
      notes: row.notes,
      metadata: row.metadata,
      created_at: row.event_timestamp,
      updated_at: row.event_timestamp
    }))
    
    return events
  } catch (error) {
    console.error(`Error fetching ${eventType} events:`, error)
    throw error
  }
}

/**
 * Get today's events for a baby
 */
export async function getTodaysEvents(babyId: string): Promise<Event[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('baby_id', babyId)
    .gte('timestamp', today.toISOString())
    .lt('timestamp', tomorrow.toISOString())
    .order('timestamp', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch today's events: ${error.message}`)
  }

  return data
}

/**
 * Create a new event
 */
export async function createEvent(
  babyId: string,
  eventType: EventType,
  options: {
    timestamp?: Date
    duration?: number
    notes?: string
    metadata?: EventMetadata
  } = {}
): Promise<Event> {
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('User must be authenticated')
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      baby_id: babyId,
      created_by: user.user.id,
      type: eventType,
      timestamp: options.timestamp?.toISOString() || new Date().toISOString(),
      duration: options.duration || null,
      notes: options.notes || null,
      metadata: options.metadata || {}
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`)
  }

  return data
}

/**
 * Create a nursing event
 */
export async function createNursingEvent(
  babyId: string,
  side: 'left' | 'right',
  duration: number,
  options: {
    timestamp?: Date
    notes?: string
  } = {}
): Promise<Event> {
  return createEvent(babyId, 'nursing', {
    ...options,
    duration,
    metadata: {
      nursing: { side }
    }
  })
}

/**
 * Create a sleep event
 */
export async function createSleepEvent(
  babyId: string,
  duration: number,
  options: {
    timestamp?: Date
    notes?: string
  } = {}
): Promise<Event> {
  return createEvent(babyId, 'sleep', {
    ...options,
    duration
  })
}

/**
 * Create a pumping event
 */
export async function createPumpingEvent(
  babyId: string,
  options: {
    timestamp?: Date
    duration?: number
    notes?: string
    side?: 'left' | 'right' | 'both'
    milliliters?: number
  } = {}
): Promise<Event> {
  const metadata: EventMetadata = {}
  
  if (options.side || options.milliliters) {
    metadata.pumping = {
      side: options.side,
      milliliters: options.milliliters
    }
  }

  return createEvent(babyId, 'pumping', {
    timestamp: options.timestamp,
    duration: options.duration,
    notes: options.notes,
    metadata
  })
}

/**
 * Create a diaper change event
 */
export async function createDiaperEvent(
  babyId: string,
  options: {
    timestamp?: Date
    notes?: string
  } = {}
): Promise<Event> {
  return createEvent(babyId, 'diaper', options)
}

/**
 * Create a bottle feeding event
 */
export async function createBottleEvent(
  babyId: string,
  options: {
    timestamp?: Date
    notes?: string
    milliliters?: number
  } = {}
): Promise<Event> {
  const metadata: EventMetadata = {}
  
  if (options.milliliters) {
    metadata.bottle = { milliliters: options.milliliters }
  }

  return createEvent(babyId, 'bottle', {
    timestamp: options.timestamp,
    notes: options.notes,
    metadata
  })
}

/**
 * Create a solid food event
 */
export async function createSolidsEvent(
  babyId: string,
  options: {
    timestamp?: Date
    notes?: string
  } = {}
): Promise<Event> {
  return createEvent(babyId, 'solids', options)
}

/**
 * Update an event
 */
export async function updateEvent(
  eventId: string,
  updates: Partial<Pick<Event, 'duration' | 'notes' | 'metadata' | 'timestamp'>>
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`)
  }

  return data
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`)
  }
}

/**
 * Get event statistics for a baby
 */
export async function getEventStats(babyId: string, days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('events')
    .select('type, duration, timestamp')
    .eq('baby_id', babyId)
    .gte('timestamp', startDate.toISOString())

  if (error) {
    throw new Error(`Failed to fetch event stats: ${error.message}`)
  }

  // Calculate statistics
  const stats = data.reduce((acc, event) => {
    const type = event.type
    if (!acc[type]) {
      acc[type] = { count: 0, totalDuration: 0 }
    }
    acc[type].count++
    if (event.duration) {
      acc[type].totalDuration += event.duration
    }
    return acc
  }, {} as Record<EventType, { count: number; totalDuration: number }>)

  return stats
}