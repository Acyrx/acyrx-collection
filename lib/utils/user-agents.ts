export function parseUserAgent(userAgent: string): { browser: string; os: string } {
    let browser = "Unknown Browser"
    let os = "Unknown OS"
  
    // Detect browser
    if (userAgent.includes("Firefox")) {
      browser = "Firefox"
    } else if (userAgent.includes("Edg")) {
      browser = "Microsoft Edge"
    } else if (userAgent.includes("Chrome")) {
      browser = "Chrome"
    } else if (userAgent.includes("Safari")) {
      browser = "Safari"
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
      browser = "Opera"
    }
  
    // Detect OS
    if (userAgent.includes("Windows NT 10")) {
      os = "Windows 10/11"
    } else if (userAgent.includes("Windows")) {
      os = "Windows"
    } else if (userAgent.includes("Mac OS X")) {
      os = "macOS"
    } else if (userAgent.includes("Linux")) {
      os = "Linux"
    } else if (userAgent.includes("Android")) {
      os = "Android"
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      os = "iOS"
    }
  
    return { browser, os }
  }
  
  export function getDeviceType(userAgent: string): "desktop" | "mobile" | "tablet" | "unknown" {
    const ua = userAgent.toLowerCase()
  
    if (ua.includes("ipad") || ua.includes("tablet")) {
      return "tablet"
    }
  
    if (ua.includes("mobile") || ua.includes("iphone") || (ua.includes("android") && ua.includes("mobile"))) {
      return "mobile"
    }
  
    if (ua.includes("windows") || ua.includes("mac os") || (ua.includes("linux") && !ua.includes("android"))) {
      return "desktop"
    }
  
    return "unknown"
  }
  