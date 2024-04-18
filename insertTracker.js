// Function to capture full URL along with the referrer
function getPageDetails() {
    return {
        url: window.location.href,
        referrer: document.referrer, // where the visitor came from
        nextPage: '', // this will be updated on navigation
        startTime: performance.now(), // capturing the start time of the page visit
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        colorDepth: window.screen.colorDepth,
        javaEnabled: navigator.javaEnabled(),
        cookiesEnabled: navigator.cookieEnabled,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        onlineStatus: navigator.onLine,
        batteryLevel: null,
        geolocation: null,
        deviceType: getDeviceType(),
        orientation: getOrientation(),
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        referrerDetails: getReferrerDetails(),
        queryParams: getUrlParameters() // Capturing all URL parameters

    };
}

// Function to parse all URL query parameters
function getUrlParameters() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    return params;
}

// Function to get the device type (mobile, tablet, desktop)
function getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/Mobi/.test(userAgent)) {
        return 'mobile';
    } else if (/Tablet/.test(userAgent)) {
        return 'tablet';
    } else {
        return 'desktop';
    }
}

// Function to get the device orientation (portrait or landscape)
function getOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

// Function to get the referring page details
function getReferrerDetails() {
    const referrer = document.referrer;
    if (referrer && !isSameDomain(referrer, window.location.href)) {
        return {
            url: referrer,
            button: getButtonClicked(referrer)
        };
    }
    return null;
}

// Function to check if two URLs belong to the same domain
function isSameDomain(url1, url2) {
    const domain1 = extractDomain(url1);
    const domain2 = extractDomain(url2);
    return domain1 === domain2;
}

// Function to extract the domain from a URL
function extractDomain(url) {
    const anchor = document.createElement('a');
    anchor.href = url;
    return anchor.hostname;
}

// Function to get the button clicked on the referring page
function getButtonClicked(referrerUrl) {
    const searchParams = new URLSearchParams(new URL(referrerUrl).search);
    return searchParams.get('button') || null;
}

// Enhanced data capture for elements interacted with
function captureElementInformation(element) {
    const elementInfo = {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        name: element.name,
        type: element.type,
        textContent: element.textContent.trim().substring(0, 100),
        dataAttributes: getElementDataAttributes(element),
        position: { x: element.offsetLeft, y: element.offsetTop },
        dimensions: { width: element.offsetWidth, height: element.offsetHeight },
        cssPath: getElementCSSPath(element),
        computedStyle: window.getComputedStyle(element),
        visibility: element.offsetWidth > 0 && element.offsetHeight > 0
    };
    return elementInfo;
}

// Function to get CSS path of an element
function getElementCSSPath(element) {
    if (!(element instanceof Element)) return '';
    var path = [];
    while (element.nodeType === Node.ELEMENT_NODE) {
        var selector = element.nodeName.toLowerCase();
        if (element.id) {
            selector += '#' + element.id;
            path.unshift(selector);
            break;
        } else {
            var sib = element, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector)
                    nth++;
            }
            if (nth != 1)
                selector += ":nth-of-type(" + nth + ")";
        }
        path.unshift(selector);
        element = element.parentNode;
    }
    return path.join(" > ");
}

// Function to get data attributes of an element
function getElementDataAttributes(element) {
    const dataAttributes = {};
    for (let attr of element.attributes) {
        if (attr.name.startsWith('data-')) {
            dataAttributes[attr.name] = attr.value;
        }
    }
    return dataAttributes;
}

// Capturing navigation to another page
function captureNavigation() {
    window.addEventListener("beforeunload", function(event) {
        const duration = performance.now() - pageDetails.startTime;
        transmitNavigationData({
            ...pageDetails,
            nextPage: window.location.href,
            duration: duration
        });
    });
}

// Generic event handler function
function handleEvent(event) {
    const eventData = {
        type: event.type,
        timestamp: new Date().toISOString(),
        cursorPosition: { x: event.clientX, y: event.clientY },
        target: captureElementInformation(event.target),
        pageDetails: getPageDetails(),
        scrollPosition: { x: window.scrollX, y: window.scrollY },
        keystroke: event.key || null,
        mouseButton: event.button,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
    };

    if (event.target.parentElement) {
        eventData.parentElement = captureElementInformation(event.target.parentElement);
    }

    transmitEventData(eventData);
}

// Function to transmit navigation data
function transmitNavigationData(data) {
    console.log('Transmitting navigation data:', data);
    fetch('/api/navigation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch(error => console.error('Error transmitting data:', error));
}

// Function to transmit event data
function transmitEventData(eventData) {
    console.log('Transmitting event data:', eventData);
    fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    }).catch(error => console.error('Error transmitting data:', error));
}

// Function to capture battery level
function captureBatteryLevel() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            pageDetails.batteryLevel = battery.level;
        });
    }
}

// Function to capture geolocation
function captureGeolocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            pageDetails.geolocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        }, error => {
            console.error('Error capturing geolocation:', error);
        });
    }
}

// Function to capture page visibility changes
function captureVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
        transmitEventData({
            type: 'visibilitychange',
            timestamp: new Date().toISOString(),
            pageDetails: getPageDetails(),
            hidden: document.hidden
        });
    });
}

// Function to capture page scroll events
function captureScroll() {
    window.addEventListener('scroll', throttle(() => {
        transmitEventData({
            type: 'scroll',
            timestamp: new Date().toISOString(),
            pageDetails: getPageDetails(),
            scrollPosition: { x: window.scrollX, y: window.scrollY }
        });
    }, 1000));
}

// Initialize and attach event listeners when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const pageDetails = getPageDetails();
    document.addEventListener("click", handleEvent);
    document.addEventListener("submit", handleEvent);
    document.addEventListener("input", handleEvent);
    document.addEventListener("change", handleEvent);
    document.addEventListener("keydown", handleEvent);
    document.addEventListener("mousemove", throttle(handleEvent, 1000)); // Throttle mousemove events
    captureNavigation(); // Set up navigation tracking
    captureBatteryLevel(); // Capture battery level
    captureGeolocation(); // Capture geolocation
    captureVisibilityChange(); // Capture page visibility changes
    captureScroll(); // Capture page scroll events
    captureOrientation(); // Capture device orientation changes
});

// Function to capture device orientation changes
function captureOrientation() {
    window.addEventListener('orientationchange', () => {
        transmitEventData({
            type: 'orientationchange',
            timestamp: new Date().toISOString(),
            pageDetails: getPageDetails(),
            orientation: getOrientation()
        });
    });
}

// Throttle function to limit the rate of event handling
function throttle(func, wait) {
    let waiting = false;
    return function() {
        if (!waiting) {
            func.apply(this, arguments);
            waiting = true;
            setTimeout(() => {
                waiting = false;
            }, wait);
        }
    };
}

function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

