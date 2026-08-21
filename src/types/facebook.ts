export type FacebookAttachmentImage = {
  src?: string
  url?: string
}

export type FacebookAttachment = {
  media_type?: string
  media?: {
    image?: FacebookAttachmentImage
  }
  url?: string
  subattachments?: {
    data?: Array<{
      media_type?: string
      media?: {
        image?: FacebookAttachmentImage
      }
      url?: string
    }>
  }
}

export type FacebookFeedPost = {
  id?: string
  message?: string
  created_time?: string
  permalink_url?: string
  full_picture?: string
  attachments?: {
    data?: FacebookAttachment[]
  }
}

export type FacebookLatestCard = {
  id: string
  platform: string
  time: string
  title: string
  text: string
  href: string
  image?: string
}
