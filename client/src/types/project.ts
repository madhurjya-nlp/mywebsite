export type ProjectListItem = {
  slug: string;
  title: string;
  year: string;
  role: string;
  summary: string;
  tags: string[];
};

export type ProjectHighlight = {
  label: string;
  text: string;
};

export type ProjectMedia = {
  kind: string;
  label: string;
  ratio: string;
};

export type ProjectDetail = ProjectListItem & {
  body: string[];
  highlights: ProjectHighlight[];
  media: ProjectMedia[];
};
