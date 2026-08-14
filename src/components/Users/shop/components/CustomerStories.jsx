"use client";
import React, { useState, useEffect } from 'react';
import { customerStoryApi } from '@/api/customerStory.api';
import CustomerStoriesLayout from './CustomerStoriesLayout';

export default function CustomerStories({ pageKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await customerStoryApi.getByPage(pageKey, true, 'active');
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load customer stories:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [pageKey]);

  // If loading or there is no active section/stories to display, return null
  if (loading || !data || !data.is_active || !data.stories || data.stories.length === 0) {
    return null;
  }

  return (
    <CustomerStoriesLayout 
      title={data.title}
      image={data.image}
      stories={data.stories}
    />
  );
}
