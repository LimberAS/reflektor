{{/*
Set default values.
*/}}
{{- define "reflektor.defaultValues" }}
{{- if not .defaultValuesSet }}

  {{- $_ := set .Values "loggerMode" (default "gke" .Values.loggerMode) }}

  {{- $_ := set .Values "imagePull" (default dict .Values.imagePull) }}
  {{- $_ := set .Values.imagePull "registry" (default "ghcr.io/limberas" .Values.imagePull.registry) }}

  {{- $_ := set .Values "input" (default dict .Values.input) }}
  {{- $_ := set .Values.input "mountedEnvSecrets" (default dict .Values.input.mountedEnvSecrets) }}
  {{- $_ := set .Values.input.mountedEnvSecrets "entries" (default list .Values.input.mountedEnvSecrets.entries) }}


  {{- $_ := set .Values "exportOptions" (default dict .Values.exportOptions) }}
  {{- $_ := set .Values.exportOptions "nfs" (default dict .Values.exportOptions.nfs) }}
  {{- $_ := set .Values.exportOptions.nfs "localVolume" (default (dict "emptyDir" (dict)) .Values.exportOptions.nfs.localVolume) }}

  {{- $_ := set . "defaultValuesSet" true }}
{{- end }}
{{- end }}
