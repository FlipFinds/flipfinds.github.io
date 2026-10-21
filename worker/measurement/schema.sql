CREATE TABLE IF NOT EXISTS daily_counts (
  day TEXT NOT NULL,
  event TEXT NOT NULL,
  page TEXT NOT NULL,
  tool TEXT NOT NULL,
  device TEXT NOT NULL,
  detail TEXT NOT NULL,
  total INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(day,event,page,tool,device,detail)
) WITHOUT ROWID;
