#!/usr/bin/env bash
# สร้างโครงฟีเจอร์ใหม่ให้เหมือนกันทุกครั้ง:  ./scripts/new-feature.sh geofence
set -euo pipefail
FEATURE="${1:?usage: ./scripts/new-feature.sh <feature-name>}"
ROOT="src/features/$FEATURE"

mkdir -p "$ROOT"/{components,server,hooks,lib}
touch "$ROOT"/{schema.ts,types.ts,index.ts}
touch "$ROOT"/server/{queries.ts,actions.ts}

echo "// public API ของฟีเจอร์ $FEATURE — export เฉพาะสิ่งที่ข้างนอกใช้" > "$ROOT/index.ts"
echo "สร้าง $ROOT เรียบร้อย"
