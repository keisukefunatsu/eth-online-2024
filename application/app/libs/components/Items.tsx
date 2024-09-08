'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { erc20Abi, formatUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import React from 'react';
import { Attester__factory, TokenTransferor__factory, } from '@/app/typechain';
import Modal from 'react-modal';

// DestinationChain is sepolia
const destinationChainSelector = '16015286601757825753';

function extractHex(input: string): string {
    const parts = input.split('_');
    return parts[parts.length - 1];
}

export interface Attestation {
    chainId: string;
    transactionHash: string;
    id: string;
    schemaId: string;
    attester: string;
    revoked: boolean;
    recipients: string[];
    data: {
        price: string;
        key: string;
        id: string;
        paymentAddress: string;
    };
}

const chainIdToName = (chainId: string) => {
    switch (chainId) {
        case '84532':
            return 'BaseSepolia';
        case '80002':
            return 'amoy';
        case '11155111':
            return 'Sepolia';
        default:
            return 'Unknown';
    }
}
interface ItemsProps {
    initialChainId: string;
    selectedMenu: string | null;
}

import { ChainInfo, getAddressesByChainId } from '@/app/libs/utils/addressbook';
import Link from 'next/link';

const Items: React.FC<ItemsProps> = ({ initialChainId, selectedMenu }) => {
    const { address, chainId } = useAccount();
    const [items, setItems] = useState<Attestation[]>([]);
    const [ownedItems, setOwnedItems] = useState<Attestation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filteredItems, setFilteredItems] = useState<Attestation[]>([]);
    const [connectedChainId, setConnectedChainId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Attestation | null>(null);
    const [chainInfo, setChainInfo] = useState<ChainInfo | null>(null)

    if (!address) {
        return <div>Please connect your wallet</div>;
    }

    const { data: approvedAmountData, refetch: refetchApprovedAmount } = useReadContract({
        abi: erc20Abi,
        address: chainInfo?.USDC_TOKEN_ADDRESS as `0x${string}`,
        functionName: 'allowance',
        args: [address,
            connectedChainId?.toString() === '11155111' ? chainInfo?.SAMECHAIN_ATTESTER_ADDRESS as `0x${string}` : chainInfo?.TOKEN_TRANSFEROR_ADDRESS as `0x${string}`
        ]
    });

    const [approvedAmount, setApprovedAmount] = useState<bigint | undefined>(undefined);
    console.log('approvedAmount', approvedAmount);

    const { writeContractAsync, data: hash, isSuccess } = useWriteContract();

    useEffect(() => {
        refetchApprovedAmount()
        if (approvedAmountData !== undefined) {
            setApprovedAmount(approvedAmountData);
            console.log('approvedAmount changed:', approvedAmountData);
        }
    }, [approvedAmountData, isSuccess]);

    useEffect(() => {
        if (connectedChainId) {
            setChainInfo(getAddressesByChainId(connectedChainId))
        }
    }, [connectedChainId])

    const handleApprove = async (amount: bigint) => {
        try {
            setProgress(0);
            await writeContractAsync({
                address: chainInfo?.USDC_TOKEN_ADDRESS as `0x${string}`,
                abi: erc20Abi,
                functionName: 'approve',
                args: [
                    connectedChainId?.toString() === '11155111' ? chainInfo?.SAMECHAIN_ATTESTER_ADDRESS as `0x${string}` : chainInfo?.TOKEN_TRANSFEROR_ADDRESS as `0x${string}`,
                    amount
                ]
            });
            await refetchApprovedAmount();
            setModalMessage('Approval Completed Successfully');
            setProgress(50);
        } catch (error) {
            console.error('Error approving tokens:', error);
            setModalMessage('Approval Failed');
        }
    };

    const handleTransfer = async (item: Attestation) => {
        setIsModalOpen(true);
        setProgress(50);
        setModalMessage('Transaction in Progress');
        setTxHash(null);
        const amount = BigInt(item.data.price);
        try {
            console.log(item.id)
            if (connectedChainId === '11155111') {
                await writeContractAsync({
                    address: chainInfo?.SAMECHAIN_ATTESTER_ADDRESS as `0x${string}`,
                    abi: Attester__factory.abi,
                    functionName: 'paymentAndAttest',
                    args: [
                        BigInt(extractHex(item.id))
                    ],
                });
            } else {
                await writeContractAsync({
                    address: chainInfo?.TOKEN_TRANSFEROR_ADDRESS as `0x${string}`,
                    abi: TokenTransferor__factory.abi,
                    functionName: 'transferTokensPayLINK',
                    args: [
                        BigInt(destinationChainSelector),
                        amount,
                        BigInt(extractHex(item.id))
                    ],
                });
            }

            setProgress(100);
            setModalMessage('Transaction Completed Successfully');
            setTxHash(hash as `0x${string}`);
            setTimeout(() => setIsModalOpen(false), 3000); // モーダルを3秒後に閉じる
        } catch (error) {
            console.error('Error transferring tokens:', error);
            setProgress(0);
            setModalMessage('Transaction Failed');
            setTimeout(() => setIsModalOpen(false), 3000); // モーダルを3秒後に閉じる
        }
    }

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get('/api/sign/items', {
                    params: {
                        indexingValue: 'SignEverythingItem_v1'
                    }
                });
                setItems(response.data.attestations);
                console.log(response.data.attestations)
            } catch (error) {
                console.error('Error fetching items:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchOwnedItems = async () => {
            try {
                const response = await axios.get('/api/sign/items', {
                    params: {
                        indexingValue: `${address.toLowerCase()}_SignEverythingOwnedItem_v1`
                    }
                });
                setOwnedItems(response.data.attestations);
                console.log(response);
            } catch (error) {
                console.error('Error fetching owned items:', error);
            }
        };
        console.log('selectedMenu', selectedMenu)

        if (selectedMenu === 'ownedItems') {
            fetchOwnedItems();
        } else if (selectedMenu === 'shops' || !selectedMenu) {
            fetchItems();
        }
    }, [selectedMenu, address]);

    useEffect(() => {
        if (connectedChainId) {
            const filteredItems = items.filter(item => item.chainId === connectedChainId);
            setFilteredItems(filteredItems);
        }
    }, [connectedChainId, items]);

    useEffect(() => {
        if (chainId) {
            setConnectedChainId(chainId.toString());
        } else {
            setConnectedChainId(initialChainId);
        }
    }, [chainId, initialChainId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <main className="flex-grow p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedMenu === 'shops' || !selectedMenu) && (
                    filteredItems.length > 0 ? filteredItems.map((item) => (
                        <div
                            key={`shop-${item.data.id}-${item.chainId}`}
                            className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-200 w-full h-80"
                        >
                            <div className="relative w-full h-3/4 mb-4 flex items-center justify-center">
                                <Image src="/treasure_box.png" alt={item.data.key} layout="fill" objectFit="contain" />
                            </div>
                            <div className={`font-semibold text-center ${item.chainId === '84532' ? 'text-blue-400' : item.chainId === '80002' ? 'text-purple-500' : item.chainId === '11155111' ? 'text-gray-500' : 'text-gray-800'}`}>
                                {chainIdToName(item.chainId)}
                            </div>
                            <div className="font-semibold text-gray-800 text-center">
                                {item.data.key}
                            </div>
                            <div className="font-semibold text-gray-800 text-center">
                                {formatUnits(BigInt(item.data.price), 6)} USDC
                            </div>
                            <button onClick={() => { setIsModalOpen(true); setSelectedItem(item); }} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                Buy
                            </button>
                        </div>
                    )) : <div>No items available in shops.</div>
                )}
                {selectedMenu === 'ownedItems' && (
                    ownedItems.length > 0 ? ownedItems.map((item) => (
                        <div
                            key={`owned-${item.data.id}-${item.chainId}`}
                            className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition-shadow duration-200 w-full h-80"
                        >
                            <div className="relative w-full h-3/4 mb-4 flex items-center justify-center">
                                <Image src="/treasure_box.png" alt={item.data.key} layout="fill" objectFit="contain" />
                            </div>
                            <div className={`font-semibold text-center ${item.chainId === '84532' ? 'text-blue-400' : item.chainId === '80002' ? 'text-purple-500' : item.chainId === '11155111' ? 'text-gray-500' : 'text-gray-800'}`}>
                                {chainIdToName(item.chainId)}
                            </div>
                            <div className="font-semibold text-gray-800 text-center">
                                {item.data.key}
                            </div>
                            <Link
                                href={`https://testnet-scan.sign.global/attestation/${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                            >
                                View Signature
                            </Link>
                        </div>
                    )) : <div>No owned items available.</div>
                )}
            </main>
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Transaction Progress"
                className="modal"
                overlayClassName="modal-overlay"
                shouldCloseOnOverlayClick={true}
            >
                <h2 className="modal-title">{modalMessage}</h2>
                <div className="progress-bar">
                    <div className="progress" style={{ width: `${progress}%` }}></div>
                </div>
                {txHash && (
                    <div className="tx-hash">
                        <p>Transaction Hash:</p>
                        <p>{txHash}</p>
                    </div>
                )}
                {selectedItem && (
                    <>
                        <button
                            onClick={() => handleApprove(BigInt(selectedItem.data.price))}
                            className="modal-button bg-green-500 text-white px-4 py-2 rounded-md"
                            disabled={approvedAmount !== undefined && approvedAmount >= BigInt(selectedItem.data.price)}
                        >
                            Approve USDC
                        </button>
                        <button
                            onClick={() => handleTransfer(selectedItem)}
                            className="modal-button bg-blue-500 text-white px-4 py-2 rounded-md"
                            disabled={!approvedAmount || approvedAmount < BigInt(selectedItem.data.price)}
                        >
                            Buy
                        </button>
                    </>
                )}
                <button onClick={() => setIsModalOpen(false)} className="modal-close-button">Close</button>
            </Modal>
        </>
    );
};

export default Items;