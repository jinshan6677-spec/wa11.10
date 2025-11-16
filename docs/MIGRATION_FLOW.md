# Migration Flow Diagram

## Overview

This document provides a visual representation of the migration process from single-instance to multi-instance architecture.

## Migration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Startup                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Check Migration     │
                  │  Status              │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌──────────────────┐
    │ Already Migrated? │     │ Old Data Exists? │
    │ (.migration-      │     │ (session-data/)  │
    │  completed)       │     │                  │
    └─────────┬─────────┘     └────────┬─────────┘
              │                        │
              │ YES                    │ NO
              │                        │
              ▼                        ▼
    ┌──────────────────┐    ┌──────────────────┐
    │ Skip Migration   │    │ Skip Migration   │
    │ Continue Startup │    │ Fresh Install    │
    └──────────────────┘    └──────────────────┘
              │                        │
              └────────────┬───────────┘
                           │
                           │ YES (Need Migration)
                           │
                           ▼
              ┌────────────────────────┐
              │  Start Migration       │
              │  Process               │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Step 1: Create        │
              │  profiles/ directory   │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Step 2: Copy Session  │
              │  session-data/session/ │
              │  → profiles/default/   │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Step 3: Load          │
              │  Translation Config    │
              │  (enable-translation-  │
              │   config.json)         │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Step 4: Create        │
              │  Default Account       │
              │  (accounts.json)       │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Step 5: Mark          │
              │  Migration Complete    │
              │  (.migration-completed)│
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Migration Success     │
              │  Continue Startup      │
              └────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BEFORE MIGRATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  userData/                                                       │
│  ├── session-data/                                              │
│  │   └── session/                                               │
│  │       ├── Cookies                                            │
│  │       ├── Local Storage/                                     │
│  │       ├── IndexedDB/                                         │
│  │       └── ...                                                │
│  │                                                              │
│  └── enable-translation-config.json                             │
│      {                                                           │
│        "accounts": {                                             │
│          "default": {                                            │
│            "global": {                                           │
│              "autoTranslate": true,                              │
│              "engine": "google",                                 │
│              "targetLang": "zh-CN"                               │
│            }                                                     │
│          }                                                       │
│        }                                                         │
│      }                                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ MIGRATION
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AFTER MIGRATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  userData/                                                       │
│  ├── session-data/              ← PRESERVED (backup)            │
│  │   └── session/                                               │
│  │                                                              │
│  ├── profiles/                  ← NEW                           │
│  │   └── default/                                               │
│  │       ├── Cookies            ← COPIED                        │
│  │       ├── Local Storage/     ← COPIED                        │
│  │       ├── IndexedDB/         ← COPIED                        │
│  │       └── ...                                                │
│  │                                                              │
│  ├── accounts.json              ← NEW                           │
│  │   {                                                          │
│  │     "accounts": {                                            │
│  │       "default": {                                           │
│  │         "id": "default",                                     │
│  │         "name": "Default Account",                           │
│  │         "translation": {                                     │
│  │           "enabled": true,                                   │
│  │           "engine": "google",                                │
│  │           "targetLanguage": "zh-CN",                         │
│  │           "autoTranslate": true                              │
│  │         }                                                    │
│  │       }                                                      │
│  │     }                                                        │
│  │   }                                                          │
│  │                                                              │
│  ├── .migration-completed       ← NEW                           │
│  │   {                                                          │
│  │     "migrationDate": "2024-01-01T00:00:00.000Z",            │
│  │     "version": "1.0.0",                                      │
│  │     "migratedFrom": "single-instance",                       │
│  │     "migratedTo": "multi-instance"                           │
│  │   }                                                          │
│  │                                                              │
│  └── enable-translation-config.json  ← PRESERVED                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Migration Process                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Try Migration Step  │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌──────────────────┐
    │   Success         │     │   Error          │
    └─────────┬─────────┘     └────────┬─────────┘
              │                        │
              ▼                        ▼
    ┌──────────────────┐    ┌──────────────────┐
    │ Continue to      │    │ Log Error        │
    │ Next Step        │    │ Return Failure   │
    └──────────────────┘    └────────┬─────────┘
                                     │
                                     ▼
                          ┌──────────────────┐
                          │ Preserve         │
                          │ Original Data    │
                          │ (No Changes)     │
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ User Can:        │
                          │ - Retry          │
                          │ - Continue       │
                          │ - Exit           │
                          └──────────────────┘
```

## State Transitions

```
┌──────────────┐
│  No Data     │  Fresh install, no migration needed
└──────────────┘

┌──────────────┐
│  Old Data    │  Has session-data/, needs migration
└──────┬───────┘
       │
       │ migrate()
       ▼
┌──────────────┐
│  Migrating   │  Migration in progress
└──────┬───────┘
       │
       │ success
       ▼
┌──────────────┐
│  Migrated    │  Has .migration-completed marker
└──────────────┘

       │ error
       ▼
┌──────────────┐
│  Failed      │  Migration failed, can retry
└──────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                         main.js                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  app.whenReady().then(async () => {                             │
│                                                                  │
│    ┌──────────────────────────────────────────────┐            │
│    │  const result = await autoMigrate({          │            │
│    │    userDataPath: app.getPath('userData'),    │            │
│    │    silent: false                              │            │
│    │  });                                          │            │
│    └──────────────────┬───────────────────────────┘            │
│                       │                                          │
│                       ▼                                          │
│    ┌──────────────────────────────────────────────┐            │
│    │  if (result.migrated) {                      │            │
│    │    // Show success notification              │            │
│    │  } else if (result.error) {                  │            │
│    │    // Handle error                           │            │
│    │  }                                            │            │
│    └──────────────────────────────────────────────┘            │
│                                                                  │
│    // Continue with app initialization...                       │
│                                                                  │
│  });                                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Timeline

```
Time →

T0: App Start
│
├─ T1: Check Migration Status (< 10ms)
│
├─ T2: Detect Old Data (< 50ms)
│
├─ T3: Start Migration (if needed)
│   │
│   ├─ T3.1: Create Directories (< 100ms)
│   │
│   ├─ T3.2: Copy Session Data (100ms - 2s, depends on size)
│   │
│   ├─ T3.3: Load Translation Config (< 50ms)
│   │
│   ├─ T3.4: Create Account (< 100ms)
│   │
│   └─ T3.5: Mark Complete (< 50ms)
│
└─ T4: Continue App Startup

Total Migration Time: ~500ms - 3s (typical)
```

## Success Criteria

✅ Migration is considered successful when:

1. All session files copied to `profiles/default/`
2. Translation config loaded and converted
3. Default account created in `accounts.json`
4. `.migration-completed` marker created
5. No errors during process
6. Original data preserved

## Rollback Process

```
┌─────────────────────────────────────────────────────────────────┐
│                         ROLLBACK                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Stop Application                                             │
│     └─ Close all windows                                         │
│                                                                  │
│  2. Delete New Files                                             │
│     ├─ rm -rf profiles/                                          │
│     ├─ rm accounts.json                                          │
│     └─ rm .migration-completed                                   │
│                                                                  │
│  3. Original Data Intact                                         │
│     └─ session-data/ still exists                                │
│                                                                  │
│  4. Restart Application                                          │
│     └─ Will use old single-instance architecture                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Notes

- Migration is **non-destructive** - original data is preserved
- Migration is **idempotent** - can be run multiple times safely
- Migration is **atomic** - either completes fully or fails cleanly
- Migration is **reversible** - can rollback by deleting new files
- Migration is **fast** - typically completes in under 3 seconds
