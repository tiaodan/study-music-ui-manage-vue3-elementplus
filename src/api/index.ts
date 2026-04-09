import {deletes, get, getBaseURL, post} from './request'

const HttpManager = {
    // 获取图片信息
    attachImageUrl: (url) => `${getBaseURL()}/${url}`,
    // =======================> 管理员 API 完成
    // 登录获取token
    getLoginStatus: ({username, password}) => post(`admin/login`, {username, password}),
    // 检查登录状态
    checkLoginStatus: () => get(`admin/login/status`),

    // =======================> 用户 API 完成
    // 返回所有用户
    getAllUser: () => get(`user`),
    // 返回指定ID的用户
    getUserOfId: (id) => get(`user/detail?id=${id}`),
    // 删除用户
    deleteUser: (id) => get(`user/delete?id=${id}`),
    // =======================> 收藏列表 API 完成
    // 返回的指定用户ID收藏列表
    getCollectionOfUser: (userId) => get(`collection/detail?userId=${userId}`),
    // 删除收藏的歌曲
    deleteCollection: (userId, songId) => deletes(`collection/delete?userId=${userId}&&songId=${songId}`),

    // =======================> 评论列表 API 完成
    // 获得指定歌曲ID的评论列表
    getCommentOfSongId: (songId) => get(`comment/song/detail?songId=${songId}`),
    // 获得指定歌单ID的评论列表
    getCommentOfSongListId: (songListId) => get(`comment/songList/detail?songListId=${songListId}`),
    // 删除评论
    deleteComment: (id) => get(`comment/delete?id=${id}`),

    // =======================> 歌手 API 完成
    // 返回所有歌手
    getAllSinger: () => get(`singer`),
    // 添加歌手
    setSinger: ({name, sex, birth, location, introduction}) => post(`singer/add`, {
        name,
        sex,
        birth,
        location,
        introduction
    }),
    // 更新歌手信息
    updateSingerMsg: ({id, name, sex, birth, location, introduction}) => post(`singer/update`, {
        id,
        name,
        sex,
        birth,
        location,
        introduction
    }),
    // 删除歌手
    deleteSinger: (id) => deletes(`singer/delete?id=${id}`),

    // =======================> 歌曲 API  完成
    // 返回所有歌曲
    getAllSong: () => get(`song`),
    // 返回指定歌手ID的歌曲
    getSongOfSingerId: (id) => get(`song/singer/detail?singerId=${id}`),
    // 返回的指定用户ID收藏列表
    getSongOfId: (id) => get(`song/detail?id=${id}`),
    // 返回指定歌手名的歌曲
    getSongOfSingerName: (id) => get(`song/singerName/detail?name=${id}`),
    // 更新歌曲信息
    updateSongMsg: ({id, singerId, name, introduction, lyric}) => post(`song/update`, {
        id,
        singerId,
        name,
        introduction,
        lyric
    }),
    updateSongUrl: (id) => `${getBaseURL()}/song/url/update?id=${id}`,
    updateSongImg: (id) => `${getBaseURL()}/song/img/update?id=${id}`,
    updateSongLrc: (id) => `${getBaseURL()}/song/lrc/update?id=${id}`,
    // 删除歌曲
    deleteSong: (id) => deletes(`song/delete?id=${id}`),

    // =======================> 歌单 API 完成
    // 添加歌单t
    setSongList: ({title, introduction, style}) => post(`songList/add`, {title, introduction, style}),
    // 获取全部歌单
    getSongList: () => get(`songList`),
    // 更新歌单信息
    updateSongListMsg: ({id, title, introduction, style}) => post(`songList/update`, {id, title, introduction, style}),
    // 删除歌单
    deleteSongList: (id) => get(`songList/delete?id=${id}`),

    // =======================> 歌单歌曲 API 完成
    // 给歌单添加歌曲
    setListSong: ({songId,songListId}) => post(`listSong/add`, {songId,songListId}),
    // 返回歌单里指定歌单ID的歌曲
    getListSongOfSongId: (songListId) => get(`listSong/detail?songListId=${songListId}`),
    // 删除歌单里的歌曲
    deleteListSong: (songId) => get(`listSong/delete?songId=${songId}`),

    // =======================> 音乐工具 API (lx)
    // 名字重新格式化 - 遍历指定路径的 mp3/wav/lrc 文件，重命名为 "多作者-歌名.扩展名"
    formatFileNames: (path) => post(`import/format-name`, {path}),
    // 移动文件到HDD
    moveFiles: (fromPath, toPath) => post(`import/move-file`, {fromPath, toPath}),
    // 规整进数据库 - 遍历指定路径的文件，解析歌手→插入作者→插入歌曲→关联song-singer
    importToDatabase: (path) => post(`import/songs`, {path}),
    // 一键导入-单歌手-所有专辑
    importSingerAlbums: (from, to) => post(`import/singer/albums`, {from, to}),

    // =======================> AWS S3 管理 API
    // 列出文件夹列表
    listS3Folders: (prefix = "") => get(`s3/folders?prefix=${encodeURIComponent(prefix)}`),
    // 创建文件夹
    createS3Folder: (path) => post(`s3/folder`, {path}),
    // 删除文件夹
    deleteS3Folder: (path) => deletes(`s3/folder?path=${encodeURIComponent(path)}`),
    // 获取文件夹详情
    getS3FolderInfo: (path) => get(`s3/folder/info?path=${encodeURIComponent(path)}`),
    // 列出文件夹内文件
    listS3Objects: (path, limit = 100) => get(`s3/objects?path=${encodeURIComponent(path)}&limit=${limit}`),
    // 上传文件
    uploadS3File: (path) => `${getBaseURL()}/s3/upload?path=${encodeURIComponent(path)}`,
    // 获取文件详情
    getS3ObjectInfo: (key) => get(`s3/object/info?key=${encodeURIComponent(key)}`),
    // 获取下载链接
    getS3DownloadUrl: (key, expire = 3600) => get(`s3/object/download?key=${encodeURIComponent(key)}&expire=${expire}`),
    // 复制文件
    copyS3Object: (sourceKey, destKey) => post(`s3/object/copy`, {sourceKey, destKey}),
    // 删除文件
    deleteS3Object: (path) => deletes(`s3/object?path=${encodeURIComponent(path)}`),
    // 批量获取文件信息
    batchGetS3ObjectsInfo: (keys) => post(`s3/objects/batch/info`, {keys}),
    // 批量复制文件
    batchCopyS3Objects: (items) => post(`s3/objects/batch/copy`, {items}),
    // 批量删除文件
    batchDeleteS3Objects: (keys) => deletes(`s3/objects/batch`, {data: {keys}})

}

export {HttpManager}
