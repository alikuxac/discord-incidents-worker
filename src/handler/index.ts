/* eslint-disable no-case-declarations */
import { API_BASE } from '../constants'
import { StatusPageIncident, StatusPageResult } from '../interface/StatusPage'
import { DateTime } from 'luxon'

import WebhookClient from '../lib/WebhookClient'
import { DataEntry } from '../interface/DataEntry'

export default async function update(env: Env) {
  const hook = new WebhookClient(env.WEBHOOK_ID, env.WEBHOOK_TOKEN);

  const fetchApi = (await fetch(`${API_BASE}/incidents.json`).then((r) =>
    r.json(),
  )) as StatusPageResult
  const { incidents } = fetchApi
  const now = DateTime.now().setZone('UTC+7');

  const updateIncident = async (
    incident: StatusPageIncident,
    messageID?: string,
  ) => {
    const embed = hook.buildEmbed(incident)
    try {
      const message = await (messageID
        ? hook.editMessage(embed, messageID)
        : hook.sendMessage(embed))
      await env.INCIDENTS.put(
        incident.id,
        JSON.stringify({
          incidentID: incident.id,
          lastUpdate: DateTime.now().toISO(),
          messageID: message.id,
          resolved:
            incident.status === 'resolved' || incident.status === 'postmortem',
        }),
      )
    } catch (error) {
      console.error(error)
    }
  }

  const incidentsfilter = incidents.filter((incident) => {
    const create_date = DateTime.fromISO(incident.created_at, { zone: 'UTC+7' })
    const diff = now.diff(create_date, ['days'])
    return diff.days <= 14
  })
  for (const incident of incidentsfilter) {
    const entry = await env.INCIDENTS.get<DataEntry>(`${incident.id}`, 'json')
    if (!entry) {
      await updateIncident(incident)
      continue
    }
    const incidentUpdate = DateTime.fromISO(
      incident.updated_at ?? incident.created_at,
      { zone: 'UTC+7' },
    )
    if (DateTime.fromISO(entry.lastUpdate) < incidentUpdate) {
      await updateIncident(incident, entry.messageID)
    }
  }
  return new Response('Ok')
}


