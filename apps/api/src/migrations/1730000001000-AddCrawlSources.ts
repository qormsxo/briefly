import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCrawlSources1730000001000 implements MigrationInterface {
  name = 'AddCrawlSources1730000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "crawl_sources" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "theme" character varying(40) NOT NULL,
        "url" character varying NOT NULL,
        "title" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_crawl_sources_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_crawl_sources_userId_url" UNIQUE ("userId", "url"),
        CONSTRAINT "FK_crawl_sources_userId" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "feedId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD COLUMN "crawlSourceId" uuid`,
    );
    await queryRunner.query(`
      ALTER TABLE "articles"
        ADD CONSTRAINT "FK_articles_crawlSourceId"
        FOREIGN KEY ("crawlSourceId")
        REFERENCES "crawl_sources"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_articles_crawlSourceId_link"
      ON "articles" ("crawlSourceId", "link")
      WHERE "crawlSourceId" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_articles_crawlSourceId_link"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "FK_articles_crawlSourceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN IF EXISTS "crawlSourceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "feedId" SET NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "crawl_sources"`);
  }
}
