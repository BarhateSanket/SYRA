import { useEffect, useRef, useCallback } from 'react';

const useTouchGestures = (elementRef, callbacks = {}) => {
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const isGesturingRef = useRef(false);

  const {
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onSwipeUp = () => {},
    onSwipeDown = () => {},
    onPinchIn = () => {},
    onPinchOut = () => {},
    onTap = () => {},
    onDoubleTap = () => {},
    onLongPress = () => {},
    swipeThreshold = 50,
    pinchThreshold = 0.1
  } = callbacks;

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
      touches: e.touches.length
    };

    if (e.touches.length === 2) {
      // Multi-touch for pinch gestures
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      touchStartRef.current.distance = distance;
    }

    isGesturingRef.current = false;
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;

    // Detect swipe gestures
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Handle pinch gestures
    if (e.touches.length === 2 && touchStartRef.current.distance) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const scale = currentDistance / touchStartRef.current.distance;

      if (scale < (1 - pinchThreshold)) {
        onPinchIn(scale);
        isGesturingRef.current = true;
      } else if (scale > (1 + pinchThreshold)) {
        onPinchOut(scale);
        isGesturingRef.current = true;
      }
    }

    // Mark as gesturing if moved significantly
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      isGesturingRef.current = true;
    }
  }, [onPinchIn, onPinchOut, pinchThreshold]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const startTime = touchStartRef.current.time;
    const endTime = Date.now();

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;

    // Detect swipe gestures
    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight(deltaX);
        } else {
          onSwipeLeft(Math.abs(deltaX));
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown(deltaY);
        } else {
          onSwipeUp(Math.abs(deltaY));
        }
      }
    }
    // Detect tap gestures
    else if (!isGesturingRef.current && deltaTime < 300) {
      // Single tap
      onTap({ x: endX, y: endY });

      // Check for double tap
      if (touchEndRef.current && (endTime - touchEndRef.current.time) < 300) {
        const distance = Math.sqrt(
          Math.pow(endX - touchEndRef.current.x, 2) +
          Math.pow(endY - touchEndRef.current.y, 2)
        );
        if (distance < 30) {
          onDoubleTap({ x: endX, y: endY });
        }
      }

      touchEndRef.current = { x: endX, y: endY, time: endTime };
    }
    // Detect long press
    else if (deltaTime > 500 && !isGesturingRef.current) {
      onLongPress({ x: endX, y: endY, duration: deltaTime });
    }

    touchStartRef.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, onLongPress, swipeThreshold]);

  // Attach event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    // Utility functions for programmatic gesture triggering
    triggerSwipeLeft: () => onSwipeLeft(swipeThreshold),
    triggerSwipeRight: () => onSwipeRight(swipeThreshold),
    triggerSwipeUp: () => onSwipeUp(swipeThreshold),
    triggerSwipeDown: () => onSwipeDown(swipeThreshold),
    triggerTap: (position = { x: 0, y: 0 }) => onTap(position),
    triggerDoubleTap: (position = { x: 0, y: 0 }) => onDoubleTap(position),
    triggerLongPress: (position = { x: 0, y: 0 }) => onLongPress({ ...position, duration: 1000 })
  };
};

export default useTouchGestures;
