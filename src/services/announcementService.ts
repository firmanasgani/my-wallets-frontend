import apiClient from './apiService'

export interface Announcement {
  id: string
  title: string
  content: string
  isActive: boolean
  startsAt: string
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

class AnnouncementService {
  async getActive(): Promise<Announcement[]> {
    const response = await apiClient.get<Announcement[]>('/announcements/active')
    return response.data
  }
}

export default new AnnouncementService()
