import {
  EMBED_COLOR_BLACK,
  EMBED_COLOR_GREEN,
  EMBED_COLOR_ORANGE,
  EMBED_COLOR_RED,
  EMBED_COLOR_YELLOW,
} from '../constants'
import { StatusPageIncident } from '../interface/StatusPage'
import { EmbedBuilder } from '@discordjs/builders'
import {
  APIEmbedField,
  APIMessage,
  RESTPatchAPIWebhookWithTokenMessageResult,
  RouteBases,
  Routes,
} from 'discord-api-types/v10'
import { DateTime } from 'luxon';

export default class WebhookClient {
  private readonly webhookID: string;
  private readonly webhookToken: string;

  constructor(webhookID: string, webhookToken: string) {
    this.webhookID = webhookID
    this.webhookToken = webhookToken
  }

  public buildEmbed(incident: StatusPageIncident): EmbedBuilder {
    const color =
      incident.status === 'resolved' || incident.status === 'postmortem'
        ? EMBED_COLOR_GREEN
        : incident.impact === 'critical'
        ? EMBED_COLOR_RED
        : incident.impact === 'major'
        ? EMBED_COLOR_ORANGE
        : incident.impact === 'minor'
        ? EMBED_COLOR_YELLOW
        : EMBED_COLOR_BLACK

    const affectedNames = incident.components.map((c) => c.name)

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTimestamp(new Date(incident.started_at))
      .setURL(incident.shortlink)
      .setTitle(incident.name)
      .setFooter({ text: incident.id })

    for (const update of incident.incident_updates.reverse()) {
      const updateDT = DateTime.fromISO(update.created_at)
      const timeString = `<t:${Math.floor(updateDT.toSeconds())}:R>`
      const field: APIEmbedField = {
        name: update.body,
        value: `${update.status.charAt(0).toUpperCase()}${update.status.slice(
          1,
        )} (${timeString})`,
        inline: false,
      }
      embed.addFields(field)
    }

    const descriptionParts = [`• Impact: ${incident.impact}`]

    if (affectedNames.length) {
      descriptionParts.push(
        `• Affected Components: ${affectedNames.join(', ')}`,
      )
    }

    embed.setDescription(descriptionParts.join('\n'))

    return embed
  }

  public async editMessage(
    embed: EmbedBuilder,
    messageID: string,
  ): Promise<APIMessage> {
    const response = (await fetch(
      `${RouteBases.api}${Routes.webhookMessage(
        this.webhookID,
        this.webhookToken,
        messageID,
      )}`,
      {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          embeds: [embed],
        }),
      },
    ).then((res) => res.json())) as RESTPatchAPIWebhookWithTokenMessageResult
    return response
  }

  public async sendMessage(embed: EmbedBuilder): Promise<APIMessage> {
    const response = (await fetch(
      `${RouteBases.api}${Routes.webhook(
        this.webhookID,
        this.webhookToken,
      )}?wait=true`,
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          embeds: [embed],
        }),
      },
    ).then((res) => res.json())) as APIMessage
    return response
  }
}
