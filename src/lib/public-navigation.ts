export const PUBLIC_NAV_LINKS = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Use Cases', href: '/use-cases' },
  { name: 'Resources', href: '/resources' },
  { name: 'About', href: '/about' },
] as const;

export const DETECTION_TOOL_LINKS = [
  { label: 'Text Detector', href: '/dashboard/text' },
  { label: 'Image Detector', href: '/dashboard/image' },
  { label: 'Video Detector', href: '/dashboard/video' },
  { label: 'Deepfake Detector', href: '/dashboard/deepfake' },
  { label: 'Plagiarism Detector', href: '/dashboard/plagiarism' },
] as const;

export const FOOTER_NAV_LINKS = {
  Product: DETECTION_TOOL_LINKS,
  Resources: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Resource Center', href: '/resources' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Limitations Policy', href: '/limitations' },
  ],
} as const;
