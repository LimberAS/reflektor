{{- define "reflektor.usedExports" -}}
    {{- range $id, $config := .Values.reflected }}
        {{- if (eq $config.export.type "nfs")  }}
            {{- $_ := set $ "reflektorExportUsesNfs" true }}
        {{- end }}
    {{- end }}
{{- end }}

{{- define "reflektor.usedWebTriggers" -}}
    {{- range $id, $config := .Values.reflected }}
        {{- range $trigger := $config.source.refreshTriggers }}
            {{- if (eq $trigger.type "web")  }}
                {{- $_ := set $ "reflektorInputUsesWebTriggers" true }}
            {{- end }}
        {{- end }}
    {{- end }}
{{- end }}
