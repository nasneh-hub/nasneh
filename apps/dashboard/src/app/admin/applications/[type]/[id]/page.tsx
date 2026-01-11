'use client';

import React from 'react';
import { ApplicationDetail } from '../../../../../components/admin/application-detail';

export default function ApplicationDetailPage({
  params,
}: {
  params: { type: string; id: string };
}) {
  return <ApplicationDetail type={params.type} id={params.id} />;
}
