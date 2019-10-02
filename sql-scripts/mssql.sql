
USE [master]
GO

CREATE LOGIN [nodejs] WITH PASSWORD=N'nodE$Js_2015!x', DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF
GO

CREATE DATABASE [NodeJsDB]
GO

USE [NodeJsDB]
GO

CREATE USER [nodejs] FOR LOGIN [nodejs] WITH DEFAULT_SCHEMA=[dbo]
GO

ALTER ROLE [db_owner] ADD MEMBER [nodejs]
GO
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[categories](
	[ID] [int] NOT NULL,
	[Category] [nvarchar](50) NOT NULL,
	[Color] [nvarchar](10) NOT NULL,
  CONSTRAINT [PK_categories] PRIMARY KEY CLUSTERED 
  (
  	[ID] ASC
  )
) ON [PRIMARY]

GO

CREATE TABLE [dbo].[todos](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Date] [date] NOT NULL,
	[Title] [nvarchar](100) NOT NULL,
	[Note] [nvarchar](max) NULL,
	[IDCategory] [int] NOT NULL,
	[Completed] [date] NULL,
	[Created] [datetime] NOT NULL,
	[Modified] [datetime] NOT NULL,
  CONSTRAINT [PK_todos] PRIMARY KEY CLUSTERED 
  (
  	[ID] ASC
  )
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		albertob
-- Create date: 10/07/2015
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[spu_todos_search] 
    @startIndex int,
    @pageSize int,
    @text nvarchar(100),
    @idCategory int,
    @status int,
	@sort nvarchar(100)=''
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @total int=0;
	DECLARE @id int = null;
	DECLARE @textSearch nvarchar(102) = '%'+@text+'%';
	DECLARE @isNumeric bit = 0;

	IF @status is null
		SET @status=0;
	IF @idCategory = -1
		SET @idCategory = null

	IF ISNUMERIC(@text)=1
	BEGIN
		SET @isNumeric=1;
		SET @id = cast(@text as int);
	END

	IF Isnull(@sort,'') = ''
		SET @sort='ID';	-- default sort
	SET @sort = REPLACE(REPLACE(@sort, '  ',' '), '  ', ' ');
	
	IF @sort like '% asc'
		SET @sort = REPLACE(@sort, ' asc','');

	SELECT @total=count(*) 
	FROM [todos] 
	WHERE ([id] =@id OR [title] LIKE IsNull(@textSearch,[title]))
	  AND [idCategory]=IsNull(@idCategory,[idCategory])
	  AND (@status=0 OR ( @status=1 AND NOT([completed] is null)) OR (@status=2 AND [completed] is null));

	SELECT T.[id], [date], [title], [note], [idCategory], [category], [color]
		, [completed], [created], [modified], @total AS [totalItems]
	FROM [todos] T 
		INNER JOIN [categories] C ON T.[idCategory]=C.[id]
	WHERE (T.[id] =@id OR [title] LIKE IsNull(@textSearch,[title]))
	  AND [idCategory]=IsNull(@idCategory,[idCategory])
	  AND (@status=0 OR ( @status=1 AND NOT([completed] is null)) OR (@status=2 AND [completed] is null))
	ORDER BY 
		CASE WHEN @sort='id' THEN T.[id] END,
		CASE WHEN @sort='id desc' THEN T.[id] END DESC,
		CASE WHEN @sort='title' THEN [title] END,
		CASE WHEN @sort='title desc' THEN [title] END DESC,
		CASE WHEN @sort='date' THEN [date] END,
		CASE WHEN @sort='date desc' THEN [date] END DESC,
		CASE WHEN @sort='category' THEN [category] END,
		CASE WHEN @sort='category desc' THEN [category] END DESC,
		CASE WHEN @sort='modified' THEN [modified] END,
		CASE WHEN @sort='modified desc' THEN [modified] END DESC
	OFFSET @startIndex ROWS FETCH NEXT @pageSize ROWS ONLY;

END

GO

INSERT [dbo].[categories] ([ID], [Category], [Color]) VALUES (0, N'Undefined', N'#BCBCBC')
INSERT [dbo].[categories] ([ID], [Category], [Color]) VALUES (1, N'Red', N'#EB8D90')
INSERT [dbo].[categories] ([ID], [Category], [Color]) VALUES (2, N'Green', N'#A6DD9E')
INSERT [dbo].[categories] ([ID], [Category], [Color]) VALUES (3, N'Blue', N'#97B3E4')
INSERT [dbo].[categories] ([ID], [Category], [Color]) VALUES (4, N'Yellow', N'#FFFA87')
INSERT [dbo].[categories] ([ID], [Category], [Color]) VALUES (5, N'Purple', N'#B09CDD')
INSERT [dbo].[categories] ([ID], [Category], [Color]) VALUES (6, N'Orange', N'#F6B280')

GO
SET IDENTITY_INSERT [dbo].[todos] ON 
GO
INSERT [dbo].[todos] ([ID], [Date], [Title], [Note], [IDCategory], [Completed], [Created], [Modified]) VALUES (1, CAST(N'2019-09-28' AS Date), N'App todo', N'eseguire test', 1, NULL, CAST(N'2019-09-28T14:37:56.903' AS DateTime), CAST(N'2019-09-28T14:38:15.350' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[todos] OFF
GO




