-- First create ChannelMember table
CREATE TABLE "ChannelMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMember_pkey" PRIMARY KEY ("id")
);

-- Create unique index
CREATE UNIQUE INDEX "ChannelMember_userId_channelId_key" ON "ChannelMember"("userId", "channelId");

-- Add creatorId column with default value (will use user 1 for existing channels)
ALTER TABLE "Channel" ADD COLUMN "creatorId" INTEGER;

-- Set existing channels to have user 1 as creator (or the first user)
UPDATE "Channel" SET "creatorId" = (SELECT "id" FROM "User" ORDER BY "id" LIMIT 1) WHERE "creatorId" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "Channel" ALTER COLUMN "creatorId" SET NOT NULL;

-- Add foreign keys
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add existing channel creators as members
INSERT INTO "ChannelMember" ("userId", "channelId", "role")
SELECT "creatorId", "id", 'CREATOR' FROM "Channel"
ON CONFLICT ("userId", "channelId") DO NOTHING;
