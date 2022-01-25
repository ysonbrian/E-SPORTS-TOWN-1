const express = require('express');
const router = express.Router();
const { sellNft, setToken, setBidding } = require('../controllers/Mint.js');

const auctionData = require('../models/AuctionData');
const Users = require('../models/Users');
const multiAuctionData = require('../models/MultiAuctionData');

router.get('/click', async (req, res) => {
  try {
    const data = await auctionData.find();
    if (data) {
      res.json(data);
    } else {
      console.log('No data!');
    }
  } catch (error) {
    console.log(error);
  }
});

router.post('/:id/bidding', async (req, res) => {
  const { currentAddress, tokenId, bid } = req.body.metadata;
  try {
    const user = await Users.find({ userAddress: currentAddress });
    const auction = await auctionData.find({ tokenId: tokenId });
    if (auction.length === 0) {
      setBidding(req, res, req.body.metadata);
    } else if (auction[0]?.biddingList?.length === 1) {
      let max = auction[0]?.biddingList[0].bidPrice;
      if (max >= Number(bid)) {
        return res.send({ message: 'lowerThanMax' });
      } else {
        setBidding(req, res, req.body.metadata);
      }
    } else if (user[0]?.token >= Number(bid)) {
      let max = auction[0]?.biddingList?.reduce((acc, val) => {
        return acc > val.bidPrice ? acc : val.bidPrice;
      });
      if (max < Number(bid)) {
        setBidding(req, res, req.body.metadata);
      } else {
        return res.send({ message: 'lowerThanMax' });
      }
    } else {
      return res.send({ message: 'NoMoney' });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get('/multiclick', async (req, res) => {
  try {
    const data = await multiAuctionData.find();
    console.log('multiclick');
    if (data) {
      console.log(data);
      res.json(data);
    } else {
      console.log('No data!');
    }
  } catch (error) {
    console.log(error);
  }
});

router.post('/:id/Grouping', async (req, res) => {
  const { tokenId, tokenOwnerAddress, joinerCnt, currentAddress, priceper1 } =
    req.body.metadata;

  console.log('tokenId :' + tokenId);
  console.log('tokenOwnerAddress :' + tokenOwnerAddress);
  console.log('joinerCnt :' + joinerCnt);
  console.log('currentAddress :' + currentAddress);
  console.log('priceper1 :' + priceper1);
  //console.log("signature :" + signature)

  const newMultiAuctionData = new multiAuctionData({
    tokenId: tokenId,
    tokenOwnerAddress: tokenOwnerAddress,
    totalJoinerCnt: joinerCnt,
    GroupAddressList: [{ GroupAddress: currentAddress }],
    GroupPricePer1: priceper1,
  });

  try {
    await newMultiAuctionData.save();
    const groupData = await multiAuctionData.find({ tokenId: tokenId });
    console.log(groupData);
    return res.send(groupData);
  } catch (err) {
    console.log(err);
  }
});

router.put('/:id/AddJoinerGrouping', async (req, res) => {
  const { GroupInfo, currentAddress } = req.body.metadata;

  console.log('GroupInfo :' + GroupInfo);
  console.log('currentAddress :' + currentAddress);

  const id = GroupInfo._id;
  console.log('id', id);

  try {
    const update = await multiAuctionData.findByIdAndUpdate(id, {
      $push: { GroupAddressList: [{ GroupAddress: currentAddress }] },
    });
  } catch (err) {
    console.log(err);
  }

  //const newMultiAuctionData = new multiAuctionData({
  //  tokenId: tokenId,
  //  tokenOwnerAddress: tokenOwnerAddress,
  //  totalJoinerCnt: joinerCnt,
  //  GroupAddressList: [{GroupAddress: currentAddress}],
  //  GroupPricePer1: priceper1,
  //});

  //try {
  //  await newMultiAuctionData.save();
  //  const groupData = await multiAuctionData.find({tokenId : tokenId});
  //  console.log(groupData)
  //  return res.send(groupData)
  //} catch(err) {
  //  console.log(err)
  //}
});

router.post('/:id/sell', async (req, res) => {
  // 멀티시그에서 받아오는 정보를 type으로 구분해서 setMultiContract를 설정해야함
  // 현재 밑은 단일 판매용도로만 진행됨
  console.log(req.body);
  setToken(req, res);
  setTimeout(() => {
    sellNft(req, res, req.body.metadata);
  }, 3000);
  setTimeout(() => {
    setApproveForAll(req, res, req.body.metadata);
  }, 3000);
  // try {

  // } catch (error) {
  //   console.log(error);
  // }
});

module.exports = router;
